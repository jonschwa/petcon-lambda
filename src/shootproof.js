const rp = require('request-promise')

// @todo set env var
const apiKey = process.env('SHOOTPROOF_API_KEY')

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

  console.log(postData)

  // try {
  const resp = await rp.post({
    uri: `https://api.shootproof.com/v2?method=${params.method}&access_token=${apiKey}`,
    form: postData,
    json: true
  })
  console.log(resp)
  console.log(resp.contact)
  return resp.contact
  // } catch (err) {
  //   console.log(err)
  // }
}

async function createGallery (data, contact) {
  console.log(contact)
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

  console.log(postData)

  // try {
  const resp = await rp.post({
    uri: `https://api.shootproof.com/v2?method=${params.method}&access_token=${apiKey}`,
    form: postData,
    json: true
  })
  console.log(resp.event)
  return resp.event
  // } catch (err) {
  //   console.log(err)
  // }
}

// input_data = {
//   first_name: 'javascript',
//   last_name: 'test',
//   email: 'js@test.com',
//   pet_name: 'testpetjs'
// }

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
  // try {
  contact = await createContact(data)
  console.log('created contact')
  console.log(contact)

  if (contact) {
    console.log('creating gallery...')
    gallery = await createGallery(data, contact)
    console.log('created gallery')
    console.log(gallery)
    console.log('sending email')
    return gallery
  } else {
    throw new Error('error')
  }

  // } catch (err) {
  //   console.log(err)
  // }
}

exports.handler = async function (event, context, callback) {
  try {
    await handle(JSON.parse(event.body))
    return callback(null, {
      statusCode: 200,
      body: 'that sync worked!'
    })
  } catch (err) {
    console.log('shit')
    return callback(null, {
      statusCode: 400,
      body: 'shits fucked'
    })
  }
}
