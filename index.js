const { equipments } = require('./database')
const database = require('./database')
const { ApolloServer, gql } = require('apollo-server')
const typeDefs = gql`
    type Query {
        teams: [Team]
        team(id: Int): Team
        equipments: [Equipment]
        supplies: [Supply]
    }
    type Mutation {
        deleteEquipment(id: String): Equipment
        insertEquipment(
            id: String,
            used_by: String,
            count: Int,
            new_or_used: String
        ): Equipment
        editEquipment(
            id: String,
            used_by: String,
            count: Int,
            new_or_used: String
        ): Equipment
    }
    type Team {
        id: Int
        manager: String
        office: String
        extension_number: String
        mascot: String
        cleaning_duty: String
        project: String
        supplies: [Supply]
    }
    type Equipment {
        id: String
        used_by: String
        count: Int
        new_or_used: String
    }
    type Supply {
        id: String
        team: Int
    }
`
const resolvers = {
    Query: {
        teams: () => database.teams
            .map((team) => {
                team.supplies = database.supplies
                    .filter((supply) => {
                        return supply.team === team.id;
                    })
            }),
        team: (parent, args, context, info) => {
            database.teams
                .filter((team) => {
                    return team.id === args.id
                })[0]
        },
        equipments: () => database.equipments,
        supplies: () => database.supplies
    },
    Mutation: {
        insertEquipment: (parent, args, context, info) => {
            database.equipments.push(args)
            return args
        },

        editEquipment: (parent, args, context, info) => {
            return database.equipments
                .filter((equipment) => {
                    return equipment.id === args.id
                }).map((equipment) => {
                    Object.assign(equipment, args)
                    return equipment;
                })[0]
        },

        deleteEquipment: (parent, args, context, info) => {
            const deletedEquipment = database.equipments
                .filter((equipment) => {
                    return equipment.id === args.id
                })[0]
            database.equipments = database.equipments
                .filter((equipment) => {
                    return equipment.id !== args.id
                })
            return deletedEquipment
        }
    }
}
const server = new ApolloServer({ typeDefs, resolvers })
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})