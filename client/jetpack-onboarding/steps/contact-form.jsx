/** @format */

/**
 * External dependencies
 */
import React from 'react';
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
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingContactFormStep extends React.PureComponent {
	handleAddContactForm = () => {
		const { jpUser, siteId, token } = this.props;

		this.props.recordTracksEvent( 'calypso_jpo_contact_form_clicked', {
			blog_id: token,
			site_id_type: 'jpo',
			user_id_type: jpUser,
		} );

		this.props.saveJetpackOnboardingSettings( siteId, {
			addContactForm: true,
		} );
	};

	render() {
		const { getForwardUrl, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'Would you like to get started with a Contact Us page?' );

		return (
			<div className="steps__main">
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
						onClick={ this.handleAddContactForm }
						href={ getForwardUrl() }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingContactFormStep )
);
