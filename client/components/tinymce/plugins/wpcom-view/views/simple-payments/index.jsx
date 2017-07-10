/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';

class SimplePaymentsView extends Component {
	render() {
		return (
			<div className="wpview-content wpview-type-simple-payments">
				Hello there!
			</div>
		);
	}
}

SimplePaymentsView = localize( SimplePaymentsView );

SimplePaymentsView.match = ( content ) => {
	const match = shortcodeUtils.next( 'simple-payment', content );

	if ( match ) {
		return {
			index: match.index,
			content: match.content,
			options: {
				shortcode: match.shortcode
			}
		};
	}
};

SimplePaymentsView.serialize = ( content ) => {
	return encodeURIComponent( content );
};

SimplePaymentsView.edit = ( editor, content ) => {
	editor.execCommand( 'simplePaymentsButton', content );
};

export default SimplePaymentsView;
