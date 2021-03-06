const { ask, replacer, tag: getOrigin } = require('gen-util')
const $ = require('shelljs')

const main = async () => {
  console.log('cwd')
  await $.cd(`${__dirname}/..`)

  const withHub = !!$.which('hub')

  console.log('config')
  const origin = await getOrigin()
  const name = await ask('project npm name?')
  const repo = withHub ? await ask('project repo? (arg to `hub create`)') : {}
  const author = await ask('your name?', {default: 'Andrew J. Monks <a@monks.co>'})
  const currentYear = new Date().getFullYear()
  const config = {name, repo, author, origin, currentYear}

  console.log('write log')
  $.ShellString(JSON.stringify(config, undefined, 2))
    .to(`.gen.json`)

  console.log('remove git')
  await $.rm('-rf', '.git')

  console.log('remove __gen__')
  await $.rm('-rf', '__gen__')

  console.log('do repalcements')
  const files = $.find('.')
  const replace = replacer(files)
  await replace(/__CURRENT_YEAR/, currentYear)
  await replace(/__PACKAGE_NAME/, name)
  await replace(/__AUTHOR_NAME/, author)

  console.log('yarn')
  await $.exec('yarn')

  console.log('make new git')
  await $.exec('git init')
  await $.exec('git add .')
  await $.exec("git commit -am 'Initial commit'")
  $.which('hub') && await $.exec(`hub create ${repo}`)
  $.which('hub') && await $.exec('git push -u origin master')

  console.log('💥')
}

main()

