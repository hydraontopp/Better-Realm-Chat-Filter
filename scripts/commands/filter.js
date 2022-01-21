import { World, Commands } from "mojang-minecraft"
import CommandBuilder from "../classes/builders/CommandBuilder.js";
import CommandHandler from "../classes/CommandRegistration.js"
import database from "../utils/database.js"

const registration = new CommandBuilder()
.setName('filter')
.setAliases(['f'])
.setDescription('filter words in chat sent by players!')
.setUsage([
  'filter add <blockedword: string & required> <blockmessagetoplayer: string & optional>', 
  'filter remove <blockedword: string & required>',
  'filter list'
])
.setCancelMessage(true)
.setRequiredTags(['staff'])
.addGroup(group => {
  return group.setName('add').setDescription('group for adding blocked words!').setAliases(['a']).addInput(input => {
    return input.setName('blockedword').setRequired(true).setDescription('block word you want to filter!')
  }).addInput(input => {
    return input.setName('messagesenttoplayeronblockdetect').setDescription('the message you want to send the player if they send this blocked word')
  })
})
.addGroup(group => {
  return group.setName('remove').setDescription('group for removing blocked words!').setAliases(['r']).addInput(input => {
    return input.setName('blockedword').setRequired(true).setDescription('block word you want to remove from the filter!')
  })
})
.addGroup(group => {
  return group.setName('list').setDescription('list of all blocked words!').setAliases(['l'])
})



CommandHandler.register(registration, (interaction) => {
  const groupRan = interaction.command.getRanGroup()
  const wordFilter = database.table('messagefilter')
  const dimension = World.getDimension('overworld')
  
  switch(groupRan.getName()) {
    case "add": 
      let addWordFilter = groupRan.getInput('blockedword').getValue()
      let addWordReturnMessage = groupRan.getInput('messagesenttoplayeronblockdetect').getValue() ?? `you cannot send "${addWordFilter}" in chat!`
      if(wordFilter.has(addWordFilter))
        return Commands.run(`tellraw "${interaction.player.nameTag}" ${JSON.stringify({ rawtext: [ { text: addWordFilter += ' is already blocked!' }]})}`, dimension)
      
      wordFilter.set(addWordFilter, { name: addWordFilter, message: addWordReturnMessage })
      return Commands.run(`tellraw "${interaction.player.nameTag}" ${JSON.stringify({ rawtext: [ { text: addWordFilter += ' has been blocked!' }]})}`, dimension)
    break;
    case "remove":
      let removeWordFilter = groupRan.getInput('blockedword').getValue()
      if(!wordFilter.has(removeWordFilter))
        return Commands.run(`tellraw "${interaction.player.nameTag}" ${JSON.stringify({ rawtext: [ { text: removeWordFilter += ' does not exist' }]})}`, dimension)
        
      wordFilter.remove(removeWordFilter)
      return Commands.run(`tellraw "${interaction.player.nameTag}" ${JSON.stringify({ rawtext: [ { text: removeWordFilter += ' has been unblocked!' }]})}`, dimension)
    break;
    case "list":
    let message = `blocked words list:\n\n`
    for(const blockedword of wordFilter.all()) {
      message += `${blockedword?.value.name}\n`
    }
    return Commands.run(`tellraw "${interaction.player.nameTag}" ${JSON.stringify({ rawtext: [ { text: message }]})}`, dimension)
    break;
    default:
    break;
  }
})