import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Confirmation from '../shared/confirmation';

class ConfirmationStep extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_reschedule_confirmation_step' );
	}

	handleClick = () => {
		const { site } = this.props;

		window.location.href = `/me/quickstart/${ site.slug }/book`;
	};

	render() {
		const { translate } = this.props;

		return (
			<Confirmation
				description={ translate( 'We will send you an email with information on how to prepare.' ) }
				title={ translate( 'Your session has been rescheduled!' ) }
			>
				<Button
					className="reschedule__schedule-button"
					onClick={ this.handleClick }
					primary={ true }
				>
					{ translate( 'View your session dashboard' ) }
				</Button>
			</Confirmation>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( ConfirmationStep ) );
