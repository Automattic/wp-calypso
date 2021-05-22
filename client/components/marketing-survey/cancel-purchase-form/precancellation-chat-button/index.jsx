/**
 * External Dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import HappychatButton from 'calypso/components/happychat/button';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hasIncludedDomain } from 'calypso/lib/purchases';
import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import './style.scss';

class PrecancellationChatButton extends Component {
	static propTypes = {
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
		const { translate } = this.props;

		return (
			<HappychatButton
				className="precancellation-chat-button__main-button"
				onClick={ this.handleClick }
			>
				{ translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( PrecancellationChatButton ) );
