/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { successNotice } from "../../state/notices/actions";
import { recordGoogleEvent } from "../../state/analytics/actions";


class U2FKeyDeleteButton extends React.Component {

	handleRemoveKeyButtonClick = () => {
		console.log('Click delete', this.props);
	};

	render() {
		return (
			<Button
				borderless
				className="security-u2f-key-delete"
				onClick={ this.handleRemoveKeyButtonClick }
			>
				<Gridicon icon="cross" />
			</Button>
		)
	}
}

export default connect(
	null,
	{
		successNotice,
		recordGoogleEvent,
	},
	null,
)( localize( U2FKeyDeleteButton ) );

