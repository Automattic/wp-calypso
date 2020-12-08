# I18n Utils

I18n-related utilities, for use both client- and server-side.

## Usage

```js
import i18nUtils from 'calypso/lib/i18n-utils';
```

### Loading Waiting User Translations

Intended primarily for reviewers, Calypso can be instructed to load waiting
translations for a specific user from translate.wordpress.com using the
query parameter `?load-user-translations=username`.

E.g. <https://wordpress.com/start/user/es?load-user-translations=exampleusername>

In addition, `project` (default `wpcom`), `translationSet` (default: `default`)
and/or `locale` (default current locale) can be used to load specific
translations, for example `&locale=de&translationSet=formal` to select formal
german strings, or `&project=test` to load test strings from the test project.
