const express = require('express')
const port = process?.env?.PORT || 5000;

const app = express()
  .set('port', port)
const path = require('path');
app.set('view engine', 'html');

  // Static public files
app.use(express.static(path.join(__dirname, 'public')))
 
// enable CORS 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*"); //req.headers.origin may be passed iso '*' 
  res.header('Access-Control-Allow-Headers', "Content-Type, X-Requested-With, Origin, Accept"); 
  res.header('Content-Type', '*')
  next() 
})

// body parser
app.use(express.urlencoded({ 
  parameterLimit: 100000,
  limit: '50mb',
  extended : true 
}))
app.use(express.json({limit: '50mb', extended: true}))

app.get('/', (req, res) => {
  // accepts absolute path or must specify `root`
  res.sendFile('public/exemple.html', { root: __dirname }) 
})

app.listen(app.get('port'), () => {
    console.log(`Hypeeo Metamask Payment Dev Server running on port ${port}`);
});