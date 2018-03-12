1.9.1
------
Fix a reference to an undefined value.

1.9.0
------
Add support for [key hashing](https://github.com/Automattic/i18n-calypso/#key-hashing) and add a method [`hasTranslation()`](https://github.com/Automattic/i18n-calypso/#hastranslation-method).

1.8.5
------
Allow newer versions of xgettext-js [#46](https://github.com/Automattic/i18n-calypso/pull/46).

1.8.4
------
Bump `interpolate-components` to 1.1.1 (for React 16 compat).

1.8.3
------
Change localize hoc's es6 class --> [create-react-class](https://www.npmjs.com/package/create-react-class) so that the code is still technically es5 and will not need a build step.

1.8.2
------
Change localize hoc's React.createClass --> es6 classes for React 16 compat.

1.8.1
-----
Fix a control sequence escaping error in POT files, see [#41](https://github.com/Automattic/i18n-calypso/pull/41).

1.8.0
-----
Merge locale data with existing one when we're not switching locale, see [#40](https://github.com/Automattic/i18n-calypso/pull/40).

1.7.4
-----
Handle options with new plural syntax, see [#37](https://github.com/Automattic/i18n-calypso/pull/37).

1.7.3
-----
Improve input file pattern support, see [#25](https://github.com/Automattic/i18n-calypso/pull/25).

1.7.2
-----
Update `moment-timezone` to version `0.5.11`.

1.7.1
-----
- Allow exposed composed component, see [#25](https://github.com/Automattic/i18n-calypso/pull/25).
- Change Localize HOC display name to be consistent with react-redux, see [#29](https://github.com/Automattic/i18n-calypso/pull/29).

1.7.0
-----
Replace LRU cache implementation, see [#18](https://github.com/Automattic/i18n-calypso/pull/18).

1.6.3
-----
Add support for glob in inputFiles, see [#16](https://github.com/Automattic/i18n-calypso/pull/16).

1.6.1 + 1.6.2
-------------
Fix invalid POT output when strings contained a line break, see [#14](https://github.com/Automattic/i18n-calypso/pull/14).

1.6.0
-----
- Add method to add/overwrite translations, see [#10](https://github.com/Automattic/i18n-calypso/pull/10).
- Add ability to parse Calypso source by switching to xgettext-js 1.0.0 and enabling the necessary plugins, see [#13](https://github.com/Automattic/i18n-calypso/pull/13).

1.5.0
-----
- POT: enable output of string locations, see [#12](https://github.com/Automattic/i18n-calypso/pull/12).
