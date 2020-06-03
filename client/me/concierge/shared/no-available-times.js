/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import PrimaryHeader from './primary-header';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteWhiteGlove from 'state/selectors/is-site-white-glove';

class NoAvailableTimes extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_no_available_times' );
	}

	render() {
		const { isWhiteGlove, translate } = this.props;

		return (
			<div>
				<PrimaryHeader isWhiteGlove={ isWhiteGlove } />
				<Card>
					<h2 className="shared__no-available-times-heading">
						{ translate( 'Sorry, there are no sessions available' ) }
					</h2>
					{ isWhiteGlove && (
						<>
							We schedule one-on-one sessions up to 24 hours in advance and all upcoming sessions
							are full. Please check back later or{ ' ' }
							<a href="https://wordpress.com/help/contact">contact us in Live Chat</a>.
						</>
					) }
					{ ! isWhiteGlove &&
						translate(
							'We schedule Quick Start Sessions up to 24 hours in advance and all upcoming sessions are full. Please check back later or {{link}}contact us in Live Chat{{/link}}.',
							{
								components: {
									link: <a href="https://wordpress.com/help/contact" />,
								},
							}
						) }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( { isWhiteGlove: isSiteWhiteGlove( state, ownProps.site.ID ) } ),
	{ recordTracksEvent }
)( localize( NoAvailableTimes ) );
