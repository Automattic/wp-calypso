/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';
import { deserialize } from 'components/tinymce/plugins/simple-payments/shortcode-utils';

class SimplePaymentsView extends Component {
	render() {
		const { id } = this.props;

		return (
			<div className="wpview-content wpview-type-simple-payments">
				Hello there!
				{ id }
			</div>
		);
	}
}

SimplePaymentsView = connect( ( state, props ) => {
	const { content: shortcode } = props;

	const shortcodeData = deserialize( shortcode );

	const { id = null } = shortcodeData;

	return {
		shortcodeData,
		id,
	};
} )( localize( SimplePaymentsView ) );

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
