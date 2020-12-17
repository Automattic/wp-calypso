/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getOnboardingUrl from 'calypso/state/selectors/get-onboarding-url';

class SiteSelectorAddSite extends Component {
	recordAddNewSite = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	};

	render() {
		const { onboardingUrl, translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<Button
					borderless
					href={ `${ onboardingUrl }?ref=calypso-selector` }
					onClick={ this.recordAddNewSite }
				>
					<Gridicon icon="add-outline" /> { translate( 'Add new site' ) }
				</Button>
			</span>
		);
	}
}

export default connect(
	( state ) => ( {
		onboardingUrl: getOnboardingUrl( state ),
	} ),
	{ recordTracksEvent }
)( localize( SiteSelectorAddSite ) );
