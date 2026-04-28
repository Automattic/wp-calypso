import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Confirmation from '../shared/confirmation';

class ConfirmationStep extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_confirmation_step' );
	}

	handleClick = () => {
		window.location.reload();
	};

	render() {
		const { translate } = this.props;

		return (
			<Confirmation
				description={ translate( 'We will send you an email with information on how to prepare.' ) }
				title={ translate( 'Your session is booked!' ) }
			>
				<Button className="book__schedule-button" onClick={ this.handleClick } primary>
					{ translate( 'View your session dashboard' ) }
				</Button>
			</Confirmation>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( ConfirmationStep ) );
