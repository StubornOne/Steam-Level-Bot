import 'dotenv/config'
const SteamUser = require('steam-user')
const SteamCommunity = require('steamcommunity')
const TradeOfferManager = require('steam-tradeoffer-manager')
const SteamTotp = require('steam-totp')

const bot = new SteamUser()
const community = new SteamCommunity()
const manager = new TradeOfferManager({
	steam: bot,
	community: community,
	language: 'en'
})

function sendRandomItem() {

  manager.loadInventory(440, 2, true, (err: any, inventory : any) => {

    if (err) {
    console.log(err)

    } else {

        const offer = manager.createOffer('partner_steam_id')
        const item = inventory[Math.floor(Math.random() * inventory.length - 1)]

        offer.addMyItem(item)
        offer.setMessage(`Lucky you! You get a ${item.name}!`)

        offer.send((err: any, status: any) => {

            if (err) {
            console.log(err)

            } else {

            console.log(`Sent offer. Status: ${status}.`)

            }
        })
    }
  })
}

const botLoginOptions = {
    "accountName": process.env.STEAM_ACCOUNT_NAME,
    "password": process.env.STEAM_ACCOUNT_PASSWORD,
    "twoFactorCode": SteamTotp.generateAuthCode(process.env.STEAM_TOTP_SECRET),
    "autoRelogin": true
}

bot.logOn(botLoginOptions)


bot.on("loggedOn", () => {
    console.log("Plazar is succesfully logged in")
    bot.setPersona(1);
    bot.gamesPlayed({
      "game_id": 760,
      "game_extra_info": "Gay Club :)"
    })
})

bot.on('webSession', (sessionid: number, cookies: any) => {
    manager.setCookies(cookies)
  
    community.setCookies(cookies)
    community.startConfirmationChecker(10000)
})

bot.on('friendRelationship', (steamid: any, relationship: any) => {
    if (relationship === 2) {
      bot.addFriend(steamid)
      bot.chat.sendFriendMessage(steamid, 'Hello there! Thanks for adding me. Type !help to display all commands.')
    }
    if (relationship === 0) {
      console.log(steamid.toString(), " has unfriended.")
    }
    if (relationship === 1) {
      console.log(steamid.toString(), " has blocked us :(")
    }
  });

bot.on('friendMessage', (steamid: any, message: string) => {
  console.log("New message from " + steamid.getSteam3RenderedID() + " | " + steamid + " : " + message)
  if (steamid === '76561199168219627') {
    if (message.toLowerCase() === "!help") {
      bot.chat.sendFriendMessage(steamid, 'Hi gay! \n You have permanent discount for trading with me, enjoy :) \n And btw, no elp yet')
    }
  }
  if (message.toLowerCase() === "!help") {
    bot.chat.sendFriendMessage(steamid, 'IDK, no elp yet :))))')
  }
})

manager.on('newOffer', (offer: any) => {
    if (offer.partner.getSteamID64() === '76561198011572191' || offer.itemsToGive.length === 0) {
        offer.accept((err: any, status: any) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`Accepted offer. Status: ${status}.`)
            }
        })
    }

    else {
        offer.decline((err: any) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Canceled offer from scammer.')
        }
        })
    }
})