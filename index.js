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

app.get('/info', (request, response, next) => {
    Person.countDocuments({},
        (error, count) => {
            if (error){
                next(error)
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

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    
    Person.findByIdAndUpdate(request.params.id, {number: request.body.number}, {new: true, runValidators: true})
    .then(
        updatedPerson => {
            if (updatedPerson){
                response.json(updatedPerson)
            }
            else {
                response.status(400).end()
            }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(
        result => {response.status(204).end()}
    )
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
            .catch(error => next(error))
        }
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}

app.use(errorHandler)