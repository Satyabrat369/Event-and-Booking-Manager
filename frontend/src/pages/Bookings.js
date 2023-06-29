import React,{Component} from "react";
import ContextFromAuth from "../context/context-from-auth";
import BookingList from "../components/DisplayBookings/BookingList";
import './Spinner.css';

class BookingPage extends Component {
    state ={
        is_Loading: false,
        bookings: []
    }
    static contextType = ContextFromAuth;
    componentDidMount(){
        this.fetchBookingsForDisplay();
    }

    fetchBookingsForDisplay(){
        this.setState({is_Loading: true});
        const requestBody = {
        query: 
            `query {
                bookings {
                    _id
                    createdAt
                    event {
                        _id
                        title
                        date
                    }
                }
            }`
        }
        let currtoken = this.context.token;
        // console.log(currtoken);
        let fetchprops ={
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
            throw new Error('Fetching Bookings Failed!');
            }
            return res.json();
        })
        .then(resData => {
            // console.log(resData);
            const currbookings = resData.data.bookings;
            // console.log(currbookings);
            this.setState({bookings: currbookings});
            this.setState({is_Loading:false});
        })
        .catch(err => {
            console.log(err);
            this.setState({is_Loading:false});
        });
    }
    OnDeleting = bookingId =>{
        this.setState({is_Loading: true});
        const requestBody = {
        query: 
            `mutation {
                cancelBooking(bookingId: "${bookingId}") {
                    _id
                    title
                }
            }`
        }
        let currtoken = this.context.token;
        let fetchprops ={
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
            throw new Error('Cancelling Failed!');
            }
            return res.json();
        })
        .then(resData => {
            this.setState(prevState =>{

                const updatedBookings= [];
                prevState.bookings.forEach(element => {
                    if(element._id!==bookingId)updatedBookings.push(element);
                });
                return {bookings: updatedBookings};
            })
            this.setState({is_Loading:false});
        })
        .catch(err => {
            console.log(err);
            this.setState({is_Loading:false});
        });
    }
    render() {
        return (
            <>
            {this.state.is_Loading ? 
            (<div className="lds-facebook"><div></div><div></div><div></div></div>) 
            :
                (
                    <BookingList bookings={this.state.bookings}
                        onDelete = {this.OnDeleting}
                    />

                )
            }
            </>
        )
    }
}

export default BookingPage;