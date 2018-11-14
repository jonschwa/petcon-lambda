const rp = require('request-promise')

const apiKey = 'a565f50b945a18edb725b1e379f8a334ed133eb9'

console.log(apiKey)

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
    notes: composeNotes(data)
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
  const galleryId = composeGalleryId(data)
  const params = {
    method: 'sp.event.create',
    access_token: apiKey
  }
  const postData = {
    brand_id: 41673,
    event_name: composeGalleryName(data),
    contact_id: contact.id,
    url_slug: `petcon-${galleryId},`
  }

  const resp = await rp.post({
    uri: `https://api.shootproof.com/v2?method=${params.method}&access_token=${apiKey}`,
    form: postData,
    json: true
  })
  console.log(resp)
  return resp.event
}

function composeNotes (data) {
  return `Pet(s): ${data.Pet_Names}`
}

function composeGalleryName (data) {
  return `Petcon ${composeGalleryId(data)} - ${data.Pet_Names}`
}

function composeGalleryId (data) {
  return 12345
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
    console.log('sending email')
    return gallery
  } else {
    throw new Error('error')
  }
}

exports.handler = async function (event, context, callback) {
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
