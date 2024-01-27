const http = require('http');
const fs = require('fs');
let shelters = require('./shelter.json');                                                                             // Load the shelters data at the start

const server = http.createServer((req, res) => {

    if (req.url === '/shelters' && req.method === 'GET') {                                                            ///return the all shelters.
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(shelters));
    }

    if (req.url === '/add-shelter' && req.method === 'POST') {                                                        ///add shelter

        let bodyrequest = '';
        req.on('data', chunk => {                                                                        ///listens for the data event on the req  object
            bodyrequest += chunk.toString();
        });

        req.on('end', () => {                                                             ///The 'end' event signifies the completion of data
            try {
                const newShelter = JSON.parse(bodyrequest);
                shelters.push(newShelter);


                fs.writeFile('./shelter.json', JSON.stringify(shelters, null, 2), err => {             // Write the new shelter in the lsit
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        return res.end('Error writing to shelter.json');
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: "added successfully"}));
                });
            } catch (err) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid JSON');
            }
        });
    }


    if (req.url.startsWith('/delete-shelter/') && req.method === 'DELETE') {
        const parts = req.url.split('/');
        const id = parts[2];
        const index = shelters.findIndex(shelter => shelter.shelterid == id);

        if (index === -1) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            return res.end('Shelter not found');
        }

         shelters.splice(index, 1);                                                                       ///removes a single element from the shelters

         fs.writeFile('./shelter.json', JSON.stringify(shelters, null, 2), err => {        ///write and update the shelters
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                return res.end('Error writing to shelter.json');
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: "Shelter deleted successfully"}));
        });
    }

    if (req.url.startsWith('/edit-shelter/') && req.method === 'PUT') {                                 ///edit the specific shelter
        if (req.headers['content-type'] !== 'application/json') {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            return res.end('Invalid content type');
        }

        const parts = req.url.split('/');
        const id = parts[2];

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const updatedShelter = JSON.parse(body);
                const index = shelters.findIndex(shelter => shelter.shelterid == id);         ///return the shelter

                if (index === -1) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    return res.end('Shelter not found');
                }

                shelters[index] = {...shelters[index], ...updatedShelter};                    ////מבצע פעולת עדכון על אלמנט בתוך מערך .

                fs.writeFile('./shelter.json', JSON.stringify(shelters, null, 2), err => {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        return res.end('Error writing to shelter.json');
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: "Shelter updated successfully"}));
                });
            } catch (parseError) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid request body');
            }
        });
    }
});

const port = 7000;
server.listen(port, () => {
    console.log(`hi :- Server running at http://localhost:${port}/`);
});