# Contributing

Thank you for thinking about contributing to WordPress' Gutenberg project! If you're unsure of anything, know that you're 💯 welcome to submit an issue or pull request on any topic. The worst that can happen is that you'll be politely directed to the best location to ask your question, or to change something in your pull request. We appreciate any sort of contribution, and don't want a wall of rules to get in the way of that.

As with all WordPress projects, we want to ensure a welcoming environment for everyone. With that in mind, all contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

Before contributing, we encourage you to read our [Contributing Policy](CONTRIBUTING.md) (you're here already!) and our [Handbook](https://wordpress.org/gutenberg/handbook/). If you have any questions on any of these, please open an issue so we can help clarify them.

All WordPress projects are [licensed under the GPLv2+](LICENSE.md), and all contributions to Gutenberg will be released under the GPLv2+ license. You maintain copyright over any contribution you make, and by submitting a pull request, you are agreeing to release that contribution under the GPLv2+ license.

## Getting Started

Gutenberg is a Node.js-based project, built primarily in JavaScript.

The easiest way to get started (on MacOS, Linux, or Windows 10 with the Linux Subsystem) is by running the Local Environment setup script, `./bin/setup-local-env.sh`. This will check if you have everything installed and updated, and help you download any extra tools you need.

For other version of Windows, or if you prefer to set things up manually, be sure to have <a href="https://nodejs.org/en/">Node.js installed first</a>. You should be running a Node version matching the [current active LTS release](https://github.com/nodejs/Release#release-schedule) or newer for this plugin to work correctly. You can check your Node.js version by typing `node -v` in the Terminal prompt.

You should also have the latest release of <a href="https://npmjs.org">npm installed</a>, npm is a separate project from Node.js and is updated frequently. If you've just installed Node.js which includes a version of npm within the installation you most likely will need to also update your npm install. To update npm, type this into your terminal: `npm install npm@latest -g`

To test the plugin, or to contribute to it, you can clone this repository and build the plugin files using Node. How you do that depends on whether you're developing locally or uploading the plugin to a remote host.

### Local Environment

First, you need a WordPress Environment to run the plugin on. The quickest way to get up and running is to use the provided docker setup. Install [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) by following the most recent instructions on the docker site.
 
In the folder of your preference, clone this project and enter the working directory:
```bash
git clone git@github.com:WordPress/gutenberg.git
cd gutenberg 
```

Then, run a setup script to check if docker and node are configured properly and starts the local WordPress instance. You may need to run this script multiple times if prompted.
```
./bin/setup-local-env.sh
``` 

If everything was successful, you'll see the following ascii art:
```
Welcome to...

,⁻⁻⁻·       .                 |
|  ،⁓’.   . |---  ,---. ,---. |---. ,---. ,---. ,---.
|   | |   | |     |---' |   | |   | |---' |     |   |
`---' `---' `---’ `---’ '   ` `---' `---’ `     `---|
                                                `---'
```

The WordPress installation should be available at `http://localhost:8888` (username: `admin`, password: `password`).
Inside the "docker" directory, you can use any docker command to interact with your containers. If this port is in use, you can override it in your `docker-compose.override.yml` file. If you're running [e2e tests](https://wordpress.org/gutenberg/handbook/reference/testing-overview/#end-to-end-testing), this change will be used correctly.

To bring down this local WordPress instance later run:
```
docker-compose down
```

If you'd like to see your changes reflected in this local WordPress instance, run:
```
npm install
npm run dev
```

Alternatively, you can use your own local WordPress environment and clone this repository right into your `wp-content/plugins` directory.

Next, open a terminal (or if on Windows, a command prompt) and navigate to the repository you cloned. Now type `npm install` to get the dependencies all set up. Then you can type `npm run dev` in your terminal or command prompt to keep the plugin building in the background as you work on it.

### On A Remote Server

Open a terminal (or if on Windows, a command prompt) and navigate to the repository you cloned. Now type `npm install` to get the dependencies all set up. Once that finishes, you can type `npm run build`. You can now upload the entire repository to your `wp-content/plugins` directory on your webserver and activate the plugin from the WordPress admin.

You can also type `npm run package-plugin` which will run the two commands above and create a zip file automatically for you which you can use to install Gutenberg through the WordPress admin.

## Workflow

A good workflow for new contributors to follow is listed below:
- Fork Gutenberg repository
- Clone forked repository
- Create new branch
- Make code changes
- Commit code changes within newly created branch
- Push branch to forked repository
- Submit Pull Request to Gutenberg repository

Ideally name your branches with prefixes and descriptions, like this: `[type]/[change]`. A good prefix would be:

- `add/` = add a new feature
- `try/` = experimental feature, "tentatively add"
- `update/` = update an existing feature

For example, `add/gallery-block` means you're working on adding a new gallery block.

You can pick among all the <a href="https://github.com/WordPress/gutenberg/issues">tickets</a>, or some of the ones labelled <a href="https://github.com/WordPress/gutenberg/labels/Good%20First%20Issue">Good First Issue</a>.

The workflow is documented in greater detail in the [repository management](./docs/reference/repository-management.md) document.

## Testing

Gutenberg contains both PHP and JavaScript code, and encourages testing and code style linting for both. It also incorporates end-to-end testing using [Google Puppeteer](https://developers.google.com/web/tools/puppeteer/). You can find out more details in [Testing Overview document](./docs/reference/testing-overview.md).

## Releasing packages

This repository uses [lerna](https://lernajs.io) to manage Gutenberg modules and publish them as packages to `npm`. Lerna automatically releases all the outdated packages. To check which packages are outdated and will be released, type `npm run publish:check`.

If you have the ability to publish packages, you _must_ have [2FA enabled](https://docs.npmjs.com/getting-started/using-two-factor-authentication) on your npmjs.com account.

### Before releasing

Confirm that you're logged into `npm`, by running `npm whoami`. If you're not logged in, run `npm adduser` to login.

If you're publishing a new package, ensure that its `package.json` file contains the correct `publishConfig` settings:

```json
	"publishConfig": {
		"access": "public"
	}
```

### Development release

Run the following command to release a dev version of the outdated packages, replacing "123456" with your 2FA code. Make sure you're using a freshly generated 2FA code, rather than one that's about to timeout. This is a little cumbersome, but helps to prevent the release process from dying mid-deploy.

```bash
NPM_CONFIG_OTP=123456 npm run publish:dev
```

Lerna will ask you which version number you want to choose for each package. For a `dev` release, you'll more likely want to choose the "prerelease" option. Repeat the same for all the outdated packages and confirm your version updates.

Lerna will then publish to `npm`, commit the `package.json` changes and create the git tags.

### Production release

To release a production version for the outdated packages, run the following command, replacing "123456" with your (freshly generated, as above) 2FA code:

```bash
NPM_CONFIG_OTP=123456 npm run publish:prod
```

Choose the correct version (minor, major or patch) and confirm your choices and let Lerna do its magic.

## How Designers Can Contribute

If you'd like to contribute to the design or front-end, feel free to contribute to tickets labelled <a href="https://github.com/WordPress/gutenberg/issues?q=is%3Aissue+is%3Aopen+label%3ADesign">Design</a>. We could use your thoughtful replies, mockups, animatics, sketches, doodles. Proposed changes are best done as minimal and specific iterations on the work that precedes it so we can compare. If you use <a href="https://www.sketchapp.com/">Sketch</a>, you can grab <a href="https://cloudup.com/cMPXM8Va2cy">the source file for the mockups</a> (updated April 6th).

## Contribute to the Documentation

Documentation is automatically synced from master to the [Gutenberg Documentation Website](https://wordpress.org/gutenberg/handbook/) every 15 minutes.

To add a new documentation page, you'll have to create a Markdown file in the [docs](https://github.com/WordPress/gutenberg/tree/master/docs) folder and add an item to the [manifest file](https://github.com/WordPress/gutenberg/blob/master/docs/manifest.json).

## Reporting Security Issues

Please see [SECURITY.md](./SECURITY.md).

## Localizing Gutenberg Plugin

To translate Gutenberg in your locale or language, [select your locale here](https://translate.wordpress.org/projects/wp-plugins/gutenberg) and translate *Development* (which contains the plugin's string) and/or *Development Readme* (please translate what you see in the Details tab of the [plugin page](https://wordpress.org/plugins/gutenberg/)).

A Global Translation Editor (GTE) or Project Translation Editor (PTE) with suitable rights will process your translations in due time.

Language packs are automatically generated once 95% of the plugin's strings are translated and approved for a locale.

The eventual inclusion of Gutenberg into WordPress core means that more than 51% of WordPress installations running a translated WordPress installation will have Gutenberg's translated strings compiled into the core language pack as well.
