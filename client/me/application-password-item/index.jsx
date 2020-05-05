/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import { deleteApplicationPassword } from 'state/application-passwords/actions';
import { errorNotice } from 'state/notices/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ApplicationPasswordsItem extends React.Component {
	handleRemovePasswordButtonClick = () => {
		const { password } = this.props;

		this.props.recordGoogleEvent( 'Me', 'Clicked on Remove Application Password Button' );
		this.props.deleteApplicationPassword( password.ID );
	};

	render() {
		const { moment, password, translate } = this.props;

		return (
			<li className="application-password-item">
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
					<Gridicon icon="cross" />
				</Button>
			</li>
		);
	}
}

export default connect( null, {
	deleteApplicationPassword,
	errorNotice,
	recordGoogleEvent,
} )( localize( withLocalizedMoment( ApplicationPasswordsItem ) ) );
