/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import 'calypso/state/inline-support-article/init';

/**
 * @param {object} state Global app state
 * @returns {object} ...
 */
export default ( state ) =>
	state?.inlineSupportArticle?.actionLabel ?? translate( 'Visit article' );
