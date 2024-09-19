import { Button, ProgressBar, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { SETTING_UP_PREMIUM_SERVICES } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import fireworksIllustration from 'calypso/assets/images/illustrations/fireworks.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getJetpackProductInstallProgress from 'calypso/state/selectors/get-jetpack-product-install-progress';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThankYou from './thank-you';

const INSTALL_STATE_COMPLETE = 1;
const INSTALL_STATE_INCOMPLETE = 2;

export class PaidPlanThankYou extends Component {
	tracksEventSent = false;

	recordAutoconfigTracksEventOnce( eventName, options = {} ) {
		if ( ! this.tracksEventSent ) {
			this.tracksEventSent = true;
			this.props.recordTracksEvent( eventName, {
				checklist_name: 'jetpack',
				location: 'JetpackChecklist',
				...options,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		const { installState, site } = this.props;

		if (
			prevProps.installState !== INSTALL_STATE_COMPLETE &&
			installState === INSTALL_STATE_COMPLETE
		) {
			this.recordAutoconfigTracksEventOnce( 'calypso_plans_autoconfig_success' );
		} else if ( site && site.isSecondaryNetworkSite ) {
			this.recordAutoconfigTracksEventOnce( 'calypso_plans_autoconfig_error', {
				error: 'secondary_network_site',
			} );
		} else if ( site && ! site.canUpdateFiles ) {
			this.recordAutoconfigTracksEventOnce( 'calypso_plans_autoconfig_error', {
				error: 'cannot_update_files',
			} );
		}
	}

	render() {
		const { installProgress, installState, site, translate } = this.props;

		const securityIllustration = '/calypso/images/illustrations/security.svg';

		// Non-main site at multisite, cannot install anything
		if ( site.isSecondaryNetworkSite ) {
			return (
				<ThankYou
					illustration={ fireworksIllustration }
					showHideMessage
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>
						{ preventWidows(
							translate(
								"Unfortunately, your site is part of a multi-site network, but is not the main network site. You'll need to set up your plan features manually."
							)
						) }
					</p>
					<p>
						{ preventWidows(
							translate( "Don't worry. We'll quickly guide you through the setup process." )
						) }
					</p>
					<p>
						<Button primary href={ localizeUrl( SETTING_UP_PREMIUM_SERVICES ) } target="_blank">
							<span>{ translate( 'Set up features' ) }</span> <Gridicon icon="external" />
						</Button>
					</p>
				</ThankYou>
			);
		}

		// We cannot install anything for this site
		if ( ! site.canUpdateFiles ) {
			return (
				<ThankYou
					illustration={ fireworksIllustration }
					showHideMessage
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>
						{ preventWidows(
							translate(
								"Unfortunately, we can't modify files on your site, so you'll need to set up your plan features manually."
							)
						) }
					</p>
					<p>
						{ preventWidows(
							translate( "Don't worry. We'll quickly guide you through the setup process." )
						) }
					</p>
					<p>
						<Button primary href={ localizeUrl( SETTING_UP_PREMIUM_SERVICES ) } target="_blank">
							<span>{ translate( 'Set up features' ) }</span> <Gridicon icon="external" />
						</Button>
					</p>
				</ThankYou>
			);
		}

		return (
			<Fragment>
				{ installState === INSTALL_STATE_INCOMPLETE && (
					<ThankYou
						illustration={ fireworksIllustration }
						showHideMessage
						title={ translate( 'Thank you for your purchase!' ) }
					>
						<p>{ translate( "Now let's make sure your site is protected." ) }</p>
						<p>
							{ preventWidows(
								translate(
									"We're setting up spam filters and site backups for you first. Once that's done, our security checklist will guide you through the next steps."
								)
							) }
						</p>
						{ /* Make the progress bar more visibile by starting at 10% */ }
						<ProgressBar isPulsing total={ 100 } value={ Math.max( installProgress, 10 ) } />
					</ThankYou>
				) }
				{ installState === INSTALL_STATE_COMPLETE && (
					<ThankYou
						illustration={ securityIllustration }
						showCalypsoIntro
						showContinueButton
						title={ translate( 'So long spam, hello backups!' ) }
					>
						<p>
							{ preventWidows(
								translate( "We've finished setting up spam filtering and backups for you." )
							) }
							<br />
							{ preventWidows(
								translate( "You're now ready to finish the rest of the checklist." )
							) }
						</p>
					</ThankYou>
				) }
			</Fragment>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );

		const installProgress = getJetpackProductInstallProgress( state, siteId );

		let installState;
		// @TODO we'll need a way to detect generic error states here and add `INSTALL_STATE_ERRORED`
		if ( installProgress === 100 ) {
			installState = INSTALL_STATE_COMPLETE;
		} else {
			installState = INSTALL_STATE_INCOMPLETE;
		}

		return {
			installProgress,
			installState,
			site,
		};
	},
	{ recordTracksEvent }
)( localize( PaidPlanThankYou ) );
