const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Event{
    _id: ID!
    title: String!
    price: Float!
    desc: String!
    date: String!
    creator: User!
}

type User{
    _id: ID!
    email: String!
    password: String!
    createdEvents : [Event!]
}

type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}

type AuthData{
    userId: ID!
    token: String!
    tokenExpiration: Int!
}

input EventInput{
    title: String!
    price: Float!
    desc: String!
    date: String!
}

input UserInput{
    email: String!
    password: String!
}

type RootQuery{
    events: [Event!]!
    bookings: [Booking!]!
    login(email: String! ,password: String!): AuthData!
}

type RootMutation{
    createEvent(newEventInput: EventInput): Event
    createUser(newUserInput: UserInput): User
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
}
schema{
    query: RootQuery
    mutation: RootMutation
}
`);