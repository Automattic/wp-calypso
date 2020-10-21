/**
 * Internal dependencies
 */

import 'state/community-translator/init';

/**
 * Get community translator translations data state
 *
 * @param   {object} state Store state
 * @returns {object} Community translator translations data state
 */
export const getCommunityTranslatorTranslations = ( state ) =>
	state?.communityTranslator?.translations;
