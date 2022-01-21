import { World, Commands } from "mojang-minecraft"
import database from './utils/database.js'
import CommandHandler from "./classes/CommandRegistration.js"
import './classes/manager/EventEmitter.js'
import './commands/import.js'

World.events.beforeChat.subscribe((beforeChatPacket) => {
  //if start with prefix return
  if(beforeChatPacket.message.startsWith(CommandHandler.getPrefix())) return;

  const blockedWords = database.table('messagefilter').all()
  for(const blockedWord of blockedWords) {
    if(!beforeChatPacket.message.trim().includes(blockedWord.value.name)) continue;
    
    beforeChatPacket.cancel = true
    return Commands.run(`tellraw "${beforeChatPacket.sender.nameTag}" ${JSON.stringify({ rawtext: [ { text: blockedWord.value.message }]})}`, World.getDimension('overworld'))
  }
})