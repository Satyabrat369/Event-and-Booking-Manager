const User = require('../../models/user');
const Event = require('../../models/event');


const findUser= async userId =>{
    try{
    const user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: findEvents.bind(this, user._doc.createdEvents)
        };
    }catch(err){
        throw err;
    }
}

const findEvents = async eventIds =>{
    try{
        const events = await Event.find({_id: {$in:eventIds}});
        return events.map(event =>{
            return { 
                ...event._doc, 
                date: new Date(event._doc.date).toISOString(),
                creator: findUser.bind(this, event.creator)
            }
        })
    }catch(err){
        throw err;
    }
    
}

const findSingleEvent = async eventId =>{
    try{
        const fetchedSingleEvent = await Event.findById(eventId);
        return {...fetchedSingleEvent._doc,
            creator: findUser.bind(this,fetchedSingleEvent.creator)
        }
    }catch(err){
        // console.log('not this');
        console.log(err);
        throw err;
    }
}

exports.findUser = findUser;
exports.findEvents = findEvents;
exports.findSingleEvent = findSingleEvent;