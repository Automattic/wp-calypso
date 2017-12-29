/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import { recordTracksEvent } from 'state/analytics/actions';

class JetpackOnboardingContactFormStep extends React.PureComponent {
	clickAddContactForm = () => {
		this.props.recordTracksEvent( 'calypso_jpo_contact_form_clicked' );
	};

	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'Would you like to get started with a Contact Us page?' );

		return (
			<Fragment>
				<DocumentHead title={ translate( 'Contact Form ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.CONTACT_FORM + '/:site' }
					title="Contact Form ‹ Jetpack Onboarding"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Add a contact form' ) }
						description={ translate(
							'Not sure? You can skip this step and add a contact form later.'
						) }
						image={ '/calypso/images/illustrations/contact-us.svg' }
						onClick={ this.clickAddContactForm }
					/>
				</TileGrid>
			</Fragment>
		);
	}
}

export default connect( null, { recordTracksEvent } )(
	localize( JetpackOnboardingContactFormStep )
);
