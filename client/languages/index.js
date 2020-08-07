/**
 * External dependencies
 */
import values from 'lodash/values';

// If `languages-meta.json` is available, this import will be replaced with
// `languages-meta.json` during build.
// Be sure to keep the exact path (`languages/fallback-languages-meta.json`) as
// is, so that webpack can find and replace it.
import languagesMeta from 'languages/fallback-languages-meta.json';

export const languages = values( languagesMeta );
