import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { deleteApplicationPassword } from 'calypso/state/application-passwords/actions';
import { errorNotice } from 'calypso/state/notices/actions';

import './style.scss';

class ApplicationPasswordsItem extends Component {
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
