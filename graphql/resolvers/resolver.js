const bcrypt = require('bcryptjs');
const jwtoken = require('jsonwebtoken');

const User = require('../../models/user'); 
const Event = require('../../models/event');
const Booking = require('../../models/booking');


const {findUser, findSingleEvent} = require('./bindingData');

module.exports = {
    events: async () =>{
        try{
            const events = await Event.find()
            return events.map(event=>{
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: findUser.bind(this, event._doc.creator)
                };
            });
        }catch(err){
            throw err;
        };
    },
    createEvent: async (args, req) =>{
        if(!req.isAuth){throw new Error('Unauthorized user!');}
        let creatorID= req.userId;
        const newEvent = new Event({
            title: args.newEventInput.title,
            desc: args.newEventInput.desc,
            price: +args.newEventInput.price,
            date: new Date(args.newEventInput.date),
            creator: creatorID
        })
        let newlyCreatedEvent;
        try{
            const result = await newEvent.save();
            newlyCreatedEvent = {...result._doc, 
                date: new Date(result._doc.date).toISOString(),
                creator: findUser.bind(this, result._doc.creator)
            };
            const foundUser = await User.findById(creatorID);

            if(!foundUser){throw new Error('User does not exist.')};
            foundUser.createdEvents.push(newEvent._id);
            await foundUser.save();
            return newlyCreatedEvent;
        }
        catch(err){
            throw err;
        };
    },
    bookings: async (args,req) =>{
        if(!req.isAuth){throw new Error('Unauthorized User!');}
        try{
            const bookings = await Booking.find({user: req.userId});
            return bookings.map(booking =>{
                return{
                    ...booking._doc,
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                    event: findSingleEvent.bind(this, booking._doc.event),
                    user: findUser.bind(this, booking._doc.user)
                }
            })
        }catch(err){
            throw err;
        }
    },
    bookEvent: async (args,req) =>{
        if(!req.isAuth){throw new Error('Unauthorized User!');}
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        let creatorID= req.userId;
        const booking = new Booking({
            user: creatorID,
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString(),
            event: findSingleEvent.bind(this, booking._doc.event),
            user: findUser.bind(this, booking._doc.user)
        }
    },
    cancelBooking: async (args,req) =>{
        if(!req.isAuth){throw new Error('Unauthorized User!');}
        try{
            const booking = await Booking.findById(args.bookingId).populate('event');
            const deletedEvent = {
                ...booking.event._doc,
                creator: findUser.bind(this, booking.event._doc.creator)
            }
            await Booking.deleteOne({_id: args.bookingId});
            return deletedEvent;
        }catch(err){
            // console.log(err);
            throw err;
        }
    },
    createUser: async (args) =>{
        try{
            const user = await User.findOne({email : args.newUserInput.email})
            if(user){throw new Error('User already exists');}
            const hashedPassword = await bcrypt.hash(args.newUserInput.password,12);
            
            const newUser= new User({
                email: args.newUserInput.email,
                password: hashedPassword
            });
            const result = await newUser.save();
            return {...result._doc};
        }catch(err){
            // console.log("some error");
            throw err;
        }
    },
    login: async (args) =>{
        const foundUser = await User.findOne({email: args.email});
        if(!foundUser){throw new Error('User does not exist');}
        const foundAnyUser= await bcrypt.compare(args.password,foundUser.password);
        if(!foundAnyUser){throw new Error('Invalid credentials');}
        const tokenGenerated = jwtoken.sign({userId: foundUser._id, email: foundUser.email}, 'HashedSecretTokenVerifyingKey',{
            expiresIn: '1h'
        });
        return {userId: foundUser._id, token: tokenGenerated, tokenExpiration: 1};
    }
}