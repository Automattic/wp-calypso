/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import HelpTeaserButton from '../help-teaser-button';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';
import { planHasFeature } from 'lib/plans';
import { FEATURE_BUSINESS_ONBOARDING } from 'lib/plans/constants';

class ChatBusinessConciergeNotice extends Component {
	static propTypes = {
		from: PropTypes.string.isRequired,
		isBusinessPlanUser: PropTypes.bool.isRequired,
		moment: PropTypes.func.isRequired,
		selectedSite: PropTypes.object.isRequired,
		to: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	trackConciergeOfferClick = () => {
		analytics.tracks.recordEvent( 'calypso_help_concierge_offer_click' );
	};

	render() {
		const { moment, selectedSite, translate } = this.props;
		const fromDate = moment( this.props.from );
		const toDate = moment( this.props.to );

		if ( ! moment().isAfter( fromDate ) || ! moment().isBefore( toDate ) ) {
			return null;
		}

		if ( ! this.props.isBusinessPlanUser ) {
			return (
				<HelpTeaserButton
					title={ translate( 'Chat is temporarily closed.' ) }
					description={ translate(
						"We're still available over email in the meantime. " +
							'Chat will be back on Friday, July 21st!'
					) }
				/>
			);
		}

		return (
			<HelpTeaserButton
				onClick={ this.trackConciergeOfferClick }
				href={ `/me/concierge/${ selectedSite.slug }/book` }
				title={ translate( 'Chat with us over screenshare!' ) }
				description={ translate( 'Click here to get one-on-one help with a Happiness Engineer.' ) }
			/>
		);
	}
}

export function mapStateToProps( state ) {
	const userId = getCurrentUserId( state );
	const purchases = getUserPurchases( state, userId );
	const isBusinessPlanUser =
		purchases &&
		!! find( purchases, ( { productSlug } ) =>
			planHasFeature( productSlug, FEATURE_BUSINESS_ONBOARDING )
		);

	return { isBusinessPlanUser };
}

export default connect( mapStateToProps )( localize( ChatBusinessConciergeNotice ) );
