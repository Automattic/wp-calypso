# Calypso

[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovateapp.com/)

Calypso is the new WordPress.com front-end – a beautiful redesign of the WordPress dashboard using a single-page web application, powered by the WordPress.com REST API. Calypso is built for reading, writing, and managing all of your WordPress sites in one place.

![beautiful screenshot](https://cldup.com/zBBkP721le.png)

It’s built with JavaScript – a very light [node](https://nodejs.org/) plus [express](https://expressjs.com/) server, [React.js](https://reactjs.org/), [Redux](https://redux.js.org/), [wpcom.js](https://wpcomjs.com/), and many other wonderful libraries on the front-end.

You can read more about Calypso at [developer.wordpress.com/calypso](https://developer.wordpress.com/calypso/).

## Getting Started

You can try out the user-side of Calypso on [WordPress.com](https://wordpress.com/) (a lot of the logged-in area is Calypso; if in doubt, view source), you can poke around the code here on GitHub, or you can install it and run it locally. The latter is the most fun.

1.	Make sure you have [`git`](https://git-scm.com/), [`node`](https://nodejs.org/), and [`yarn`](https://classic.yarnpkg.com/en/docs/install) installed.
2.	Clone this repository locally.
3.	Add `127.0.0.1 calypso.localhost` to your local `hosts` file.
4.	Execute `yarn` and then `yarn start` from the root directory of the repository.
5.	Open [`calypso.localhost:3000`](http://calypso.localhost:3000/) in your browser.

Need more detailed installation instructions? [We have them](./docs/install.md).

## Contributing

If Calypso sparks your interest, don’t hesitate to send a pull request, send a suggestion, file a bug, or just ask a question. We promise we’ll be nice. Just don’t forget to check out our [CONTRIBUTING](./docs/CONTRIBUTING.md) doc – it includes a few technical details that will make the process a lot smoother.

Calypso welcomes – and indeed has been built by – contributors from all walks of life, with different backgrounds, and with a wide range of experience. We're committed to doing our part to make both Calypso and the wider WordPress community welcoming to everyone.

You can contribute in many ways. You can help reporting, testing, and detailing bugs, and also test new features we release in our "beta" program for testing on [Horizon](https://horizonfeedback.wordpress.com/).

To clarify these expectations, Calypso has adopted the code of conduct defined by the Contributor Covenant. It can be read in full [here](./CODE-OF-CONDUCT.md).

## Security

Need to report a security vulnerability? Go to [https://automattic.com/security/](https://automattic.com/security/) or directly to our security bug bounty site [https://hackerone.com/automattic](https://hackerone.com/automattic/).

## Browser Support

We support the latest two versions of all major browsers, except IE, where we currently only support 11 and Edge. (see [Browse Happy](https://browsehappy.com/) for current latest versions).

## Troubleshooting

If you have any problems running Calypso, [please see most common issues](./docs/troubleshooting.md).

## License

Calypso is licensed under [GNU General Public License v2 (or later)](./LICENSE.md).
