const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.cgp25tv.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('person', personSchema)

const getPersons = () => {
    console.log("phonebook:");
    mongoose
        .connect(url)
        .then(() => {
            Person.find({}).then(result => {
                result.forEach(person => {
                    console.log(person.name, person.number);
                })
                return mongoose.connection.close()
            })
        })
}

const addPerson = (name, number) => {

    mongoose
        .connect(url)
        .then((result) => {
            const person = new Person({name, number})
            return person.save()
        })
        .then(() => {
            console.log(`added "${name}" number ${number} to phonebook`)
            return mongoose.connection.close()
        })
        .catch((err) => console.log(err))
}

if (!name && !number){
    getPersons()
} else {
    addPerson(name, number)
}
