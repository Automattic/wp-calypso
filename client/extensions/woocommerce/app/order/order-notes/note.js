/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { stripHTML } from 'lib/formatting';

class OrderNote extends Component {
	static propTypes = {
		customer_note: PropTypes.bool,
		date_created: PropTypes.string,
		date_created_gmt: PropTypes.string,
		id: PropTypes.number,
		note: PropTypes.string,
	}

	render() {
		const { note, translate } = this.props;

		return (
			<div className="order-notes__note">
				<h4>{ translate( 'Note' ) }</h4>
				{ stripHTML( note ) }
			</div>
		);
	}
}

export default localize( OrderNote );
