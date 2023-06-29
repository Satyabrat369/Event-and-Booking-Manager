import React,{Component} from "react";
import ManagingEvents from '../components/ManagingEvents/ManagingEvents';
import Background from "../components/background/background";
import ContextFromAuth from '../context/context-from-auth';
import EventList from "../components/DisplayEvents/EventLists/EventList";


import './Events.css';
import './Spinner.css';

class EventPage extends Component {
    
    state = {
        creating: false,
        is_Loading: false,
        ViewDetailEvent: null,
        events: []
    };
    isActive=true;
    
    static contextType = ContextFromAuth;
    
    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount(){
        this.fetchEventsForDisplay();
    }
    startEventCreation =()=> {
        this.setState({creating:true});
    }
    OnConfirm = () =>{
        this.setState({ creating: false });
        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;
        
        if (
            title.trim().length === 0 ||
            date.trim().length === 0 ||
            description.trim().length === 0) {
                // console.log('entered');
            return;
        }
      
        const event = { title, price, date, description };
        console.log(event);
      
        const requestBody = {
        query: 
            `mutation {
                createEvent(newEventInput: {title: "${title}", desc: "${description}", price: ${price}, date: "${date}"}) {
                    _id
                    title
                    desc
                    price
                    date
                }
            }`
        }
            
        const currtoken = this.context.token;

        let fetchprops = {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + currtoken
            }
        }
        fetch('http://localhost:5000/graphqlinterface', fetchprops)
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Event Creation Failed!');
            }
            return res.json();
        })
        .then(resData => {
            // console.log(resData);
            this.setState(prevState =>{
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    desc: resData.data.createEvent.desc,
                    price: resData.data.createEvent.price,
                    date: resData.data.createEvent.date,
                    creator: {
                        _id: this.context.userId
                    }          
                });
                return {events: updatedEvents};
            });
            // this.fetchEventsForDisplay();
        })
        .catch(err => {
            console.log(err);
        });
    };
    
    OnCancel = () =>{
        this.setState({creating:false, ViewDetailEvent: null});
    }
    OnBooking =() =>{
        if(!this.context.token){
            this.setState({ViewDetailEvent: null});
            return;
        }
        const requestBody ={
        query:
            `mutation{
                bookEvent(eventId: "${this.state.ViewDetailEvent._id}"){
                    _id
                    createdAt
                    updatedAt
                }
            }`
        }

        const currtoken = this.context.token;
        let fetchprops = {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + currtoken
            }
        }
        fetch('http://localhost:5000/graphqlinterface', fetchprops)
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Booking Failed!');
            }
            return res.json();
        })
        .then(resData => {
            console.log(resData);
            this.setState({ViewDetailEvent: null});
        })
        .catch(err => {
            console.log(err);
            this.setState({ViewDetailEvent: null});
        });
    }

    fetchEventsForDisplay(){
        this.setState({is_Loading: true});
        // if(this.state.is_Loading)console.log("Loading");
        // console.log('entered');
        const requestBody = {
        query: 
            `query {
                events{
                    _id
                    title
                    desc
                    price
                    date
                    creator{
                        _id
                        email
                    }
                }
            }`
        }
        let fetchprops ={
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
              'Content-Type': 'application/json'
            }
        }
        fetch('http://localhost:5000/graphqlinterface', fetchprops)
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
            throw new Error('Fetching Events Failed!');
            }
            return res.json();
        })
        .then(resData => {
            // console.log(resData);
            const currevents = resData.data.events;
            if(this.isActive){
                this.setState({events: currevents});
                this.setState({is_Loading:false});
            }
        })
        .catch(err => {
            console.log(err);
            if(this.isActive){
                this.setState({is_Loading:false});
            }
        });
        
    }

    ViewDetailEventHandler = eventId =>{
        this.setState(prevState =>{
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return {ViewDetailEvent:selectedEvent};
        })
    }

    componentWillUnmount(){
        this.isActive = false;
    }
    render() {
        return (
            <>
            {this.state.ViewDetailEvent && <Background/>}
            {this.state.creating && 
            (<>
            <Background />
            <ManagingEvents title="Add Event" 
                canCancel 
                canConfirm 
                onCancel={this.OnCancel} 
                onConfirm={this.OnConfirm}
                confirmText="Confirm">
                <form>
                <div className="form-body">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" ref={this.titleElRef} />
                </div>
                <div className="form-body">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" ref={this.priceElRef} />
                </div>
                <div className="form-body">
                    <label htmlFor="date">Date</label>
                    <input type="datetime-local" id="date" ref={this.dateElRef} />
                </div>
                <div className="form-body">
                    <label htmlFor="description">Description</label>
                    <textarea
                    id="description"
                    rows="4"
                    ref={this.descriptionElRef}
                    />
                </div>
                </form>
            </ManagingEvents>
            </>)}
            {this.state.ViewDetailEvent && (
            <ManagingEvents
                title={this.state.ViewDetailEvent.title}
                canCancel
                canConfirm
                onCancel={this.OnCancel}
                onConfirm={this.OnBooking}
                confirmText={this.context.token ? 'Book': 'Confirm'}>
                <h1>{this.state.ViewDetailEvent.title}</h1>
                <h2>
                ${this.state.ViewDetailEvent.price} -{' '}
                {new Date(this.state.ViewDetailEvent.date).toLocaleDateString()}
                </h2>
                <p>{this.state.ViewDetailEvent.description}</p>
            </ManagingEvents>
            )}
            {this.context.token && (<div className="events-control">
                <p>Edit your schedule!</p>
                <button className="buttonCreateEvent" onClick={this.startEventCreation}>Create Event</button>
            </div>)}
            {this.state.is_Loading ? (<div className="lds-facebook"><div></div><div></div><div></div></div>) :
                <EventList 
                events={this.state.events} 
                authUserId={this.context.userId}
                onViewDetail={this.ViewDetailEventHandler}
                />
            }
            </>
        );
        
    }
}

export default EventPage;