/** @format */

/**
 * External dependencies
 */
import React from 'react';
import GridiconCross from 'gridicons/dist/cross';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { deleteApplicationPassword } from 'state/application-passwords/actions';
import { errorNotice } from 'state/notices/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

class ApplicationPasswordsItem extends React.Component {
	handleRemovePasswordButtonClick = () => {
		const { password } = this.props;

		this.props.recordGoogleEvent( 'Me', 'Clicked on Remove Application Password Button' );
		this.props.deleteApplicationPassword( password.ID );
	};

	render() {
		const { moment, password, translate } = this.props;

		return (
			<li className="application-password-item__password" key={ password.ID }>
				<div className="application-password-item__details">
					<h2 className="application-password-item__name">{ password.name }</h2>
					<p className="application-password-item__generated">
						{ translate( 'Generated on %s', {
							args: moment( password.generated ).format( 'lll' ),
						} ) }
					</p>
				</div>
				<Button
					borderless
					className="application-password-item__revoke"
					onClick={ this.handleRemovePasswordButtonClick }
				>
					<GridiconCross />
				</Button>
			</li>
		);
	}
}

export default connect(
	null,
	{
		deleteApplicationPassword,
		errorNotice,
		recordGoogleEvent,
	}
)( localize( ApplicationPasswordsItem ) );
