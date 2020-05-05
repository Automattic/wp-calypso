/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * @param {object} state Global app state
 * @returns {object} ...
 */
export default ( state ) =>
	state?.inlineSupportArticle?.actionLabel ?? translate( 'Visit article' );
