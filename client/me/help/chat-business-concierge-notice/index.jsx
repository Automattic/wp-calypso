/** @format */

/**
 * External dependencies
 */

import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import HelpTeaserButton from '../help-teaser-button';
import { isBusinessPlanUser } from 'state/selectors';

class ChatBusinessConciergeNotice extends Component {
	static propTypes = {
		translate: PropTypes.func,
		isBusinessPlanUser: PropTypes.bool.isRequired,
		from: PropTypes.string.isRequired,
		selectedSite: PropTypes.object.isRequired,
		to: PropTypes.string.isRequired,
		moment: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	trackConciergeOfferClick = () => {
		analytics.tracks.recordEvent( 'calypso_help_concierge_offer_click' );
	};

	render = () => {
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
	};
}

export default connect( state => ( {
	isBusinessPlanUser: isBusinessPlanUser( state ),
} ) )( localize( ChatBusinessConciergeNotice ) );
