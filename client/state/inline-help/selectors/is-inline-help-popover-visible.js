import { get } from 'lodash';

import 'calypso/state/inline-help/init';

/**
 * Returns a bool indicating if the inline help popover is currently showing.
 *
 * @param  {Object}  state  Global state tree
 * @returns {boolean}       Is the inline help popover is showing.
 */
export default function isInlineHelpPopoverVisible( state ) {
	return get( state, 'inlineHelp.popover.isVisible', false );
}
