require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response) => {
    Person.countDocuments({},
        (error, count) => {
            if (error){
                response.status(500).end(error)
            }
            else {
                console.log(count)
                response.send(
                    `<p>Phonebook has information for ${count} people</p>\n<p>This message was created at ${Date()}</p>`
                )
            }
        }
    )
}
) 

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    
    Person.findByIdAndUpdate(request.params.id, {number: request.body.number}, {new: true})
    .then(
        updatedPerson => {
            if (updatedPerson){
                response.json(updatedPerson)
            }
            else {
                response.status(400).end()
            }
    })
    .catch(error => 
        {
            console.log(error)
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id).then(
        result => {
            response.status(204).end()
        }
    )
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name){
        return response.status(400).json({ 
            error: 'Missing value for name' 
        })
    }
    if (!body.number){
        return response.status(400).json({ 
            error: 'Missing value for number' 
        })
    }

    let error_value = false
    Person.find({name: body.name}).then(person => {
        if (person.length) {
            response.status(409).json({
                error: 'Name exists in the phonebook already' 
            })
        }
        else {
            const person = Person({
                name: body.name,
                number: body.number,
            })
            person.save().then(savedPerson => {
                response.json(savedPerson)
            })
        }
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
