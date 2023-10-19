# Changelog

## 1.3.0

- Makes the `locale` argument optional on the `addLocaleToPathLocaleInFront` function and omits the locale in the path in case it is default. [https://github.com/Automattic/wp-calypso/pull/80533](#80533)
- Adds functions to override the language in the path [https://github.com/Automattic/wp-calypso/pull/80302](#80302)
- Add '/plans' url to mapping and add the locales allow list [https://github.com/Automattic/wp-calypso/pull/79570](#79570)
- Updates the `getLanguage` regex to string so it can be combined with other regexes [https://github.com/Automattic/wp-calypso/pull/78656](#78656)
- Add `/setup` localization mapping [https://github.com/Automattic/wp-calypso/pull/77313](#77313)
- The locale should no longer be added to the host, and we should use it on the path instead. [https://github.com/Automattic/wp-calypso/pull/76767](#76767)

## 1.2.0

Add support for preserving trailing slash variation in `localizeUrl`

## 1.1.0

Add support for `https://apps.wordpress.com` URLs

## 1.0.1

Add missing dependencies - @automattic/languages

## 1.0.0

- Initial release
