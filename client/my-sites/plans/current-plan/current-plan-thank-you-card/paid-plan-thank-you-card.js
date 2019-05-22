/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import { parse as parseUrl } from 'url';
import Gridicon from 'gridicons';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { preventWidows } from 'lib/formatting';
import { SETTING_UP_PREMIUM_SERVICES } from 'lib/url/support';
import { untrailingslashit } from 'lib/route';
import Button from 'components/button';
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import ProgressBar from 'components/progress-bar';
import ThankYouCard from './thank-you-card';

const INSTALL_STATE_COMPLETE = 1;
const INSTALL_STATE_INCOMPLETE = 2;

export class PaidPlanThankYouCard extends Component {
	componentDidUpdate( prevProps ) {
		if ( prevProps.progressComplete < 100 && this.props.progressComplete >= 100 ) {
			this.props.recordTracksEvent( 'calypso_plans_autoconfig_success', {
				checklist_name: 'jetpack',
				location: 'JetpackChecklist',
			} );
		}
	}

	render() {
		const { installProgress, installState, site, translate } = this.props;

		const securityIllustration = '/calypso/images/illustrations/security.svg';
		const fireworksIllustration = '/calypso/images/illustrations/fireworks.svg';

		// Jetpack is too old
		if ( ! site.hasMinimumJetpackVersion ) {
			// Link to "Plugins" page in wp-admin
			let wpAdminPluginsUrl = get( site, 'options.admin_url' );
			wpAdminPluginsUrl = wpAdminPluginsUrl
				? untrailingslashit( parseUrl( wpAdminPluginsUrl ).pathname ) + '/plugins.php'
				: undefined;

			return (
				<ThankYouCard
					illustration={ fireworksIllustration }
					showContinueButton={ ! wpAdminPluginsUrl }
					showHideMessage={ wpAdminPluginsUrl }
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>
						{ preventWidows(
							translate(
								'Unfortunately, we are unable to set up your plan because your site has an older version of Jetpack. Please upgrade Jetpack.'
							)
						) }
					</p>
					{ wpAdminPluginsUrl && (
						<p>
							<Button primary href={ wpAdminPluginsUrl } target="_blank">
								<span>{ translate( 'Upgrade Jetpack' ) }</span> <Gridicon icon="external" />
							</Button>
						</p>
					) }
				</ThankYouCard>
			);
		}

		// Non-main site at multisite, cannot install anything
		if ( site.isSecondaryNetworkSite ) {
			return (
				<ThankYouCard
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
						<Button primary href={ SETTING_UP_PREMIUM_SERVICES } target="_blank">
							<span>{ translate( 'Set up features' ) }</span> <Gridicon icon="external" />
						</Button>
					</p>
				</ThankYouCard>
			);
		}

		// We cannot install anything for this site
		if ( ! site.canUpdateFiles ) {
			return (
				<ThankYouCard
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
						<Button primary href={ SETTING_UP_PREMIUM_SERVICES } target="_blank">
							<span>{ translate( 'Set up features' ) }</span> <Gridicon icon="external" />
						</Button>
					</p>
				</ThankYouCard>
			);
		}

		return (
			<Fragment>
				<JetpackProductInstall />

				{ installState === INSTALL_STATE_INCOMPLETE && (
					<ThankYouCard
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

						<ProgressBar isPulsing total={ 100 } value={ installProgress || 0 } />
					</ThankYouCard>
				) }
				{ installState === INSTALL_STATE_COMPLETE && (
					<ThankYouCard
						illustration={ securityIllustration }
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
					</ThankYouCard>
				) }
			</Fragment>
		);
	}
}

export default connect(
	state => {
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
)( localize( PaidPlanThankYouCard ) );
