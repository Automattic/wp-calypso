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

class NoAvailableTimes extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_no_available_times' );
	}

	render() {
		const { translate } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<Card>
					<h2 className="shared__no-available-times-heading">
						{ translate( 'Sorry, there are no sessions available' ) }
					</h2>
					{ translate(
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

export default connect( null, { recordTracksEvent } )( localize( NoAvailableTimes ) );
