# Translation Chunks

This document provides details about translations chunks - what issue do they solve and how are they built and used within Calypso.

## Overview

Translations chunks' main goal is to split Calypso's translations into multiple files and to provide only the minimum set of files required for the initial render of a given view.

## The issue

Over the time, the amount of translatable UI strings in Calypso has increased significantly and has started to cause long loading times.

Upon Calypso boot any non-English user downloads a language file with all translations, which size currently gis 300-400kb gzipped for our Mag16, no matter the amount of strings actually required to render a given view. In some cases, for example login and sign up views, it would only use a fraction of the strings, but still require to download all translations.

## Building translation chunks

### Dependencies

Building translation chunks requires 3 main components - Calypso strings POT, JS chunks map, and language translations.

#### Calypso Strings POT

`yarn run translate` extracts strings with source references from Calypso and saves the required `calypso-strings.pot` file in the root of the project.

#### JS Chunks Map

We use [Webpack plugin](https://github.com/Automattic/wp-calypso/blob/HEAD/build-tools/webpack/generate-chunks-map-plugin.js) to generate basic chunks map as a JSON tree that contains all JS modules that every entry point or chunk includes. Generated chunks map is saved as `chunks-map.{BROWSERSLIST_ENV}.json` file in the root of the project.

#### Language Translations

Build script downloads all language translations from https://widgets.wp.com/languages/calypso/ and saves the files in `/public/{BROWSERSLIST_ENV}/languages`.

### Build Script

Build script can be run with `yarn run build-languages` and it will basically execute `bin/build-languages.js`, but it would only work if both `calypso-strings.pot` or `chunks-map.{BROWSERSLIST_ENV}.json` exist in the root of the project.

To ensure you have the required files, you need to build or run a development environment with either `BUILD_TRANSLATION_CHUNKS=true yarn run build` / `ENABLE_FEATURES=use-translation-chunks yarn run build` or `BUILD_TRANSLATION_CHUNKS=true yarn run start` / `ENABLE_FEATURES=use-translation-chunks yarn run start` respectively.

#### Build Script Steps

1. Downloads language revisions from - https://widgets.wp.com/languages/calypso/lang-revisions.json. It's used later for cache busting purposes.
2. Download language translations for all supported languages from https://widgets.wp.com/languages/calypso/.
3. Use source code references from `calypso-strings.pot` together with `chunks-map.{BROWSERSLIST_ENV}.json` to map the original strings that are included in a chunk. Then use original strings map to build translation chunks for each downloaded language.
4. For each downloaded language, build a language manifest file that includes the locale data and a set of all translated chunks.

Translation chunks and language manifest files are built as JSON, intended to be used when fetching in runtime, and JS, when loaded as script tag on the page.

## Using translation chunks

### Initial translation chunks setup

The initial setup for translation chunks requires having the language manifest file and all translation chunk file for each installed JS chunk, if it has one.

When conditions are met, the server will load the JS format of the initially required language manifest file and translation chunks to the document as script tags. Otherwise, JSON files will be fetched after Calypso boots.

#### Language manifest

Language manifest file is resolved by either having `window.i18nLanguageManifest` when it's loaded by using a script tag and the `.js` format, or by fetching the `.json` file from `public/{BROWSERSLIST_ENV}/languages/{localeSlug}-language-manifest.json`.

It contains the locale data and an array of translated chunks filenames. It is used to set the locale of Calypso with the initially required locale data.

#### Translation chunk files

Translation chunk file is resolved by either having `window.i18nTranslationChunks[chunk]` when it's loaded by using a script tag and the `.js` format, or by fetching the `.json` file from `public/{BROWSERSLIST_ENV}/languages/{localeSlug}-{chunk}.json`.

It contains the translation strings that specific chunk includes and is used with `i18n.addTranslations` from `i18n-calypso` to extend translations in runtime.

Since not all JS chunks may have translation chunks, we use the translated chunks array provided in language manifest file to filter out which JS chunk requests would require to additionally fetch their respective translation chunk and prevent unnecessary requests to non-existing translation chunks files that would result in 404s.

### Fetching translations on demand

We use [Webpack plugin](https://github.com/Automattic/wp-calypso/blob/HEAD/build-tools/webpack/require-chunk-callback-plugin.js) that provides an API to `window.__requireChunkCallback__` and allows us to interact with Webpack's dynamic module import API.

We hook into JS chunks' dynamic import requests and fetch their translation chunks, when needed. When fetched, the content of a translation chunk is then merged to the existing translations with `i18n.addTranslations`.
