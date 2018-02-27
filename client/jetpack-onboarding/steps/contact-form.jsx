/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ConnectSuccess from '../connect-success';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import JetpackLogo from 'components/jetpack-logo';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySites from 'components/data/query-sites';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { addQueryArgs } from 'lib/route';
import { getJetpackOnboardingPendingSteps, getUnconnectedSiteUrl } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingContactFormStep extends React.PureComponent {
	componentDidUpdate() {
		this.maybeAddContactForm();
	}

	maybeAddContactForm() {
		const { action, hasContactForm, isConnected, isRequestingSettings, stepsPending } = this.props;
		const isPending = get( stepsPending, STEPS.CONTACT_FORM );

		if (
			! isPending &&
			! isRequestingSettings &&
			isConnected &&
			hasContactForm === false &&
			action === 'add_contact_form'
		) {
			this.addContactForm();
		}
	}

	handleAddContactForm = () => {
		this.props.recordJpoEvent( 'calypso_jpo_contact_form_clicked' );

		if ( ! this.props.isConnected ) {
			return;
		}

		this.addContactForm();
	};

	handleNextButton = () => {
		this.props.recordJpoEvent( 'calypso_jpo_contact_form_next_clicked' );
	};

	addContactForm() {
		this.props.saveJpoSettings( this.props.siteId, {
			addContactForm: true,
		} );
	}

	renderActionTile() {
		const { hasContactForm, isConnected, siteUrl, translate } = this.props;
		const headerText = translate( "Let's grow your audience with Jetpack." );
		const subHeaderText = (
			<Fragment>
				{ translate(
					'A great first step is adding a Contact Us page that includes Jetpack’s contact form.'
				) }
				<br />
				{ translate(
					'Create a Jetpack account to unlock this and dozens of other Jetpack features.'
				) }
			</Fragment>
		);
		const connectUrl = addQueryArgs(
			{
				url: siteUrl,
				// TODO: add a parameter to the JPC to redirect back to this step after completion
				// and in the redirect URL include the ?action=add_contact_form parameter
				// to actually trigger the page and form creation action after getting back to JPO
			},
			'/jetpack/connect'
		);
		const href = ! isConnected ? connectUrl : null;

		return (
			<Fragment>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ ! hasContactForm ? translate( 'Add a contact form' ) : null }
						description={
							hasContactForm ? translate( 'Your contact form has been created.' ) : null
						}
						image={ '/calypso/images/illustrations/contact-us.svg' }
						onClick={ this.handleAddContactForm }
						href={ href }
					/>
				</TileGrid>
			</Fragment>
		);
	}

	render() {
		const { basePath, getForwardUrl, hasContactForm, siteId, translate } = this.props;

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Contact Form ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.CONTACT_FORM, ':site' ].join( '/' ) }
					title="Contact Form ‹ Jetpack Start"
				/>
				<QuerySites siteId={ siteId } />

				<JetpackLogo full size={ 45 } />

				{ hasContactForm ? (
					<ConnectSuccess
						href={ getForwardUrl() }
						illustration="/calypso/images/illustrations/contact-us.svg"
						onClick={ this.handleNextButton }
						title={ translate( 'Success! Jetpack has added a "Contact us" page to your site.' ) }
					/>
				) : (
					this.renderActionTile()
				) }
			</div>
		);
	}
}

export default connect( ( state, { settings, siteId, steps } ) => ( {
	hasContactForm: !! get( settings, 'addContactForm' ),
	isConnected: isJetpackSite( state, siteId ),
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingContactFormStep ) );
