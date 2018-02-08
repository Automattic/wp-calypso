/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
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
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingContactFormStep extends React.PureComponent {
	handleAddContactForm = () => {
		const { siteId } = this.props;
		this.props.recordJpoEvent( 'calypso_jpo_contact_form_clicked' );

		this.props.saveJetpackOnboardingSettings( siteId, {
			addContactForm: true,
		} );
	};

	render() {
		const { getForwardUrl, settings, translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'Would you like to get started with a Contact Us page?' );
		const hasContactForm = !! get( settings, 'addContactForm' );
		const tileProps = hasContactForm
			? {
					description: translate( 'Your contact form has been created.' ),
				}
			: {
					buttonLabel: translate( 'Add a contact form' ),
					description: translate(
						'Not sure? You can skip this step and add a contact form later.'
					),
				};

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
						image={ '/calypso/images/illustrations/contact-us.svg' }
						onClick={ this.handleAddContactForm }
						href={ getForwardUrl() }
						{ ...tileProps }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingContactFormStep )
);
