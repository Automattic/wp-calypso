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
import ConnectIntro from '../connect-intro';
import ConnectSuccess from '../connect-success';
import FormattedHeader from 'components/formatted-header';
import JetpackLogo from 'components/jetpack-logo';
import QuerySites from 'components/data/query-sites';
import getJetpackOnboardingPendingSteps from 'state/selectors/get-jetpack-onboarding-pending-steps';
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
		const { hasContactForm, siteId, translate } = this.props;
		const header = (
			<FormattedHeader
				headerText={ translate( "Let's grow your audience with Jetpack." ) }
				subHeaderText={
					<Fragment>
						{ translate(
							'A great first step is adding a Contact Us page that includes a contact form.'
						) }
						<br />
						{ translate( 'Create a Jetpack account to unlock this and dozens of other features.' ) }
					</Fragment>
				}
			/>
		);

		return (
			<ConnectIntro
				action="add_contact_form"
				buttonLabel={ ! hasContactForm ? translate( 'Add a contact form' ) : null }
				description={ hasContactForm ? translate( 'Your contact form has been created.' ) : null }
				e2eType="contact-form"
				header={ header }
				illustration="/calypso/images/illustrations/contact-us.svg"
				onClick={ this.handleAddContactForm }
				siteId={ siteId }
			/>
		);
	}

	render() {
		const { getForwardUrl, hasContactForm, siteId, translate } = this.props;

		return (
			<div className="steps__main" data-e2e-type="contact-form">
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
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingContactFormStep ) );
