/** @format */
/**
 * External dependencies
 */
import { identity } from 'lodash';
import React, { Component, PropTypes } from 'react';
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
		to: PropTypes.string.isRequired,
	};

	static defaultProps = {
		translate: identity,
	};

	trackCalendlyOfferClick = () => {
		analytics.tracks.recordEvent( 'calypso_help_calendly_offer_click' );
	};

	render = () => {
		const { translate } = this.props;
		const fromDate = i18n.moment( this.props.from );
		const toDate = i18n.moment( this.props.to );

		if ( ! i18n.moment().isAfter( fromDate ) || ! i18n.moment().isBefore( toDate ) ) {
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
				onClick={ this.trackCalendlyOfferClick }
				href="https://calendly.com/wordpressdotcom/wordpress-com-business-site-setup/"
				title={ translate( 'Chat with us over screenshare!' ) }
				description={ translate( 'Click here to get one-on-one help with a Happiness Engineer.' ) }
			/>
		);
	};
}

export default connect( state => ( {
	isBusinessPlanUser: isBusinessPlanUser( state ),
} ) )( localize( ChatBusinessConciergeNotice ) );
