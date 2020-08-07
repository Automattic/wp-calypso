/**
 * External dependencies
 */
import values from 'lodash/values';

// If `languages-meta.json` is missing, this import will be replaced with
// `fallback-languages-meta.json` during build.
// Be sure to keep the exact path (`languages/languages-meta.json`) as is, so
// that webpack can find and replace it.
import languagesMeta from 'languages/languages-meta.json';

export const languages = values( languagesMeta );
