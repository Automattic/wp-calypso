/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isInlineHelpPopoverVisible from '../is-inline-help-popover-visible';

describe( '#isInlineHelpPopoverVisible()', () => {
	test( 'should return if the popover is visible', () => {
		const state = {
			inlineHelp: {
				popover: {
					isVisible: true,
				},
			},
		};

		expect( isInlineHelpPopoverVisible( state ) ).to.be.true;
	} );
} );
