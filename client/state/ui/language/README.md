Language UI State
==================

## Actions

###`setLocale()`

Change the locale (optionally including the variant) of the application.

## Reducers

The included reducers add the following keys to the global state tree, under `ui.language`:

###`localeSlug`

The value of the current locale slug ('en', 'fr'...)

###`localeVariant`

The locale variant refers to a subset of the locale, for example formal German (Sie) ('de_formal'). 

###`isRtl`

The isRtl state of the ui language.
