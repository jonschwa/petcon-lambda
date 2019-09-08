const rp = require('request-promise')

const apiKey = process.env.SHOOTPROOF_API_KEY

async function createContact (data) {
  const params = {
    method: 'sp.contact.create',
    access_token: apiKey
  }
  const postData = {
    brand_id: 41673,
    first_name: data.First_Name,
    last_name: data.Last_Name,
    email: data.Email_Address,
    notes: `Pet(s): ${data.Pet_Names}`
  }

  const resp = await rp.post({
    uri: `https://api.shootproof.com/v2?method=${params.method}&access_token=${apiKey}`,
    form: postData,
    json: true
  })
  console.log(resp)
  return resp.contact
}

async function createGallery (data, contact) {
  const params = {
    method: 'sp.event.create',
    access_token: apiKey
  }
  const postData = {
    brand_id: 41673,
    event_name: `Petcon ${contact.email} - ${data.Pet_Names.replace(/[\W]+/g, '+')}`,
    contact_id: contact.id,
    url_slug: `petcon-${contact.id}`
  }

  const resp = await rp.post({
    uri: `https://api.shootproof.com/v2?method=${params.method}&access_token=${apiKey}`,
    form: postData,
    json: true
  })
  console.log(resp)
  return resp.event
}

async function handle (data) {
  let [contact, gallery] = [false, false]

  contact = await createContact(data)

  if (contact) {
    console.log('created contact')
    console.log(contact)
    console.log('creating gallery...')
    gallery = await createGallery(data, contact)
    console.log('created gallery')
    console.log(gallery)
    return gallery
  } else {
    throw new Error('error')
  }
}

exports.handler = async function (event, context, callback) {
  console.log(event)
  try {
    await handle(JSON.parse(event.body))
    return callback(null, {
      statusCode: 200,
      body: 'that sync worked!'
    })
  } catch (err) {
    console.log(err)
    return callback('error!', {
      statusCode: 400,
      body: err
    })
  }
}
