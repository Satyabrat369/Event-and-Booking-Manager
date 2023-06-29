import React,{Component} from "react";
import ContextFromAuth from "../context/context-from-auth";
import './Auth.css';


class AuthPage extends Component {

    state ={
        isSignup: false
    };
    static contextType = ContextFromAuth;
    constructor(props){
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }
    toggleStateHandler =() =>{
        this.setState(prevState =>{
            return {isSignup: !prevState.isSignup};
        })
    };

    fetchHandler = (event) =>{
        event.preventDefault();
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;
        if(email.trim().length === 0 || password.trim().length===0){
            return;
        }
        // console.log(email,password);

        
        let requestBody = {
            query: `
                mutation {
                    createUser(newUserInput: {email: "${email}",password: "${password}"}){
                        _id
                        email
                    }
                }
            `
        };
        if(!this.state.isSignup){
            requestBody = {
                query: `
                    query{
                        login(email: "${email}", password: "${password}"){
                            userId
                            token
                            tokenExpiration
                        }
                    }
                `
            };
        }
        let fetchProps = {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers:{
                'Content-Type': 'application/json'
            }
        }
        fetch('http://localhost:5000/graphqlinterface', fetchProps)
        .then(res =>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Request Failed!');
            }
            return res.json();
        }).then(fetchedData =>{
            console.log(fetchedData);
            if(fetchedData?.data?.login?.token){
                this.context.login(
                    fetchedData.data.login.userId, 
                    fetchedData.data.login.token, 
                    fetchedData.data.login.tokenExpiration
                );
            }
        })
        .catch(err=>{console.log(err);});
    };
    render() {
        return (
        <form className="auth-form" onSubmit={this.fetchHandler}>
            <div className="form-body">
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" ref={this.emailEl}/>
            </div>
            <div className="form-body">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={this.passwordEl}/>
            </div>
            <div className="form-action">
                <button type="submit">{this.state.isSignup?'SignUp':'LogIn'}</button>
                <button type="button" onClick={this.toggleStateHandler}>Go to {this.state.isSignup ? "LogIn":"SignUp"}</button>
            </div>
        </form>);
    }
}

export default AuthPage;