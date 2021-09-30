import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import HappychatButton from 'calypso/components/happychat/button';
import MaterialIcon from 'calypso/components/material-icon';
import { hasIncludedDomain } from 'calypso/lib/purchases';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

class PrecancellationChatButton extends Component {
	static propTypes = {
		icon: PropTypes.string,
		purchase: PropTypes.object.isRequired,
		surveyStep: PropTypes.string,
		onClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		surveyStep: '',
	};

	handleClick = () => {
		const { purchase, surveyStep, onClick } = this.props;

		this.props.recordTracksEvent( 'calypso_precancellation_chat_click', {
			survey_step: surveyStep,
			purchase: purchase.productSlug,
			is_plan: isPlan( purchase ),
			is_domain_registration: isDomainRegistration( purchase ),
			has_included_domain: hasIncludedDomain( purchase ),
		} );

		onClick();
	};

	render() {
		const { icon, translate } = this.props;

		return (
			<HappychatButton
				className="precancellation-chat-button__main-button"
				onClick={ this.handleClick }
			>
				{ icon && <MaterialIcon icon={ icon } /> }
				{ translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( PrecancellationChatButton ) );
