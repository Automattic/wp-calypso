/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the `isOpen` state of the community dialog window
 *
 * @param  {Object}  state       Global state tree
 * @return {Boolen} 			 isOpen state of the community dialog window
 */
export default function getIsCommunityTranslatorDialogOpen( state ) {
	return get( state, 'i18n.communityTranslator.isOpen', false );
}
