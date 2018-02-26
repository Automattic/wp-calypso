/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import JetpackLogo from 'components/jetpack-logo';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingContactFormStep extends React.PureComponent {
	handleAddContactForm = () => {
		const { siteId } = this.props;
		this.props.recordJpoEvent( 'calypso_jpo_contact_form_clicked' );

		this.props.saveJpoSettings( siteId, {
			addContactForm: true,
		} );
	};

	render() {
		const { basePath, getForwardUrl, settings, translate } = this.props;
		const headerText = translate( "Let's grow your audience with Jetpack." );
		const subHeaderText = (
			<Fragment>
				{ translate( "A great first step is adding Jetpack's contact form." ) }
				<br />
				{ translate(
					'Create a Jetpack account to get started and unlock this and dozens of other features.'
				) }
			</Fragment>
		);
		const hasContactForm = !! get( settings, 'addContactForm' );

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Contact Form ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.CONTACT_FORM, ':site' ].join( '/' ) }
					title="Contact Form ‹ Jetpack Start"
				/>

				<JetpackLogo full size={ 45 } />

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ ! hasContactForm ? translate( 'Add a contact form' ) : null }
						description={
							hasContactForm ? translate( 'Your contact form has been created.' ) : null
						}
						image={ '/calypso/images/illustrations/contact-us.svg' }
						onClick={ this.handleAddContactForm }
						href={ getForwardUrl() }
					/>
				</TileGrid>
			</div>
		);
	}
}

export default localize( JetpackOnboardingContactFormStep );
