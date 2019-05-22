/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteFileModDisableReason } from 'lib/site/utils';
import { isJetpackSiteMainNetworkSite, isJetpackSiteMultiSite } from 'state/sites/selectors';
import { SETTING_UP_PREMIUM_SERVICES } from 'lib/url/support';
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import ProgressBar from 'components/progress-bar';
import ThankYouCard from './thank-you-card';

const INSTALL_STATE_COMPLETE = 1;
const INSTALL_STATE_UNCOMPLETE = 2;
const INSTALL_STATE_ERRORED = 3;

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
		const {
			fileModDisableReason,
			hasMinimumJetpackVersion,
			installProgress,
			isSiteMainNetworkSite,
			isSiteMultiSite,
			translate,
			installState,
		} = this.props;

		const securityIllustration = '/calypso/images/illustrations/security.svg';
		const fireworksIllustration = '/calypso/images/illustrations/fireworks.svg';

		if ( ! hasMinimumJetpackVersion ) {
			return (
				<ThankYouCard
					illustration={ fireworksIllustration }
					showContinueButton
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>
						{ translate(
							'We are unable to set up your plan because your site has an older version of Jetpack. Please upgrade Jetpack.'
						) }
					</p>
				</ThankYouCard>
			);
		}

		// We cannot install anything for this site
		if ( fileModDisableReason && fileModDisableReason.length > 0 ) {
			return (
				<ThankYouCard
					illustration={ fireworksIllustration }
					title={ translate( 'Thank you for your purchase!' ) }
					showContinueButton
				>
					<p>
						{ translate( "We can't modify files on your site." ) }
						<br />
						{ translate( 'You will have to {{link}}set up your plan manually{{/link}}.', {
							components: {
								link: <a href={ SETTING_UP_PREMIUM_SERVICES } />,
							},
						} ) }
					</p>
				</ThankYouCard>
			);
		}

		if ( isSiteMultiSite && ! isSiteMainNetworkSite ) {
			return (
				<ThankYouCard
					illustration={ fireworksIllustration }
					showContinueButton
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>
						{ translate(
							"We can't modify files on your site. You will have to set up your plan manually."
						) }
						<br />
						{ translate( "We'll guide you through it." ) }
					</p>
				</ThankYouCard>
			);
		}

		return (
			<Fragment>
				<JetpackProductInstall />

				{ installState === INSTALL_STATE_UNCOMPLETE && (
					<ThankYouCard
						illustration={ fireworksIllustration }
						title={ translate( 'Thank you for your purchase!' ) }
					>
						<p>{ translate( "Now let's make sure your site is protected." ) }</p>
						<p>
							{ translate(
								"We're setting up spam filters and site backups for you first. Once that's done, our security checklist will guide you through the next steps."
							) }
						</p>

						<ProgressBar isPulsing total={ 100 } value={ installProgress || 0 } />

						<p>
							<a href={ this.getMyPlanRoute() }>{ translate( 'Hide message' ) }</a>
						</p>
					</ThankYouCard>
				) }
				{ installState === INSTALL_STATE_COMPLETE && (
					<ThankYouCard
						illustration={ securityIllustration }
						showContinueButton
						title={ translate( 'So long spam, hello backups!' ) }
					>
						<p>
							{ translate( 'We’ve finished setting up spam filtering and backups for you.' ) }
							<br />
							{ translate( "You're now ready to finish the rest of the checklist." ) }
						</p>
					</ThankYouCard>
				) }
				{ installState === INSTALL_STATE_ERRORED && (
					<ThankYouCard
						illustration={ securityIllustration }
						showContinueButton
						title={ translate( 'So long spam, hello backups!' ) }
					>
						<p>
							{ translate( 'Error' ) }
							<br />
							{ translate( 'Error' ) }
						</p>
					</ThankYouCard>
				) }
			</Fragment>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	const installProgress = getJetpackProductInstallProgress( state, siteId );
	const productInstallStatus = getJetpackProductInstallStatus( state, siteId );

	let installState;
	// @TODO we'll need a way to detect actual error states here
	if (
		productInstallStatus &&
		! includes( [ 'installed', 'skipped' ], productInstallStatus.akismet_status ) &&
		! includes( [ 'installed', 'skipped' ], productInstallStatus.vaultpress_status )
	) {
		installState = INSTALL_STATE_ERRORED;
	} else if ( installProgress === 100 ) {
		installState = INSTALL_STATE_COMPLETE;
	} else {
		installState = INSTALL_STATE_UNCOMPLETE;
	}

	return {
		fileModDisableReason: getSiteFileModDisableReason( site, 'modifyFiles' ),
		hasMinimumJetpackVersion: site.hasMinimumJetpackVersion,
		installProgress,
		installState,
		isSiteMainNetworkSite: isJetpackSiteMainNetworkSite( state, siteId ),
		isSiteMultiSite: isJetpackSiteMultiSite( state, siteId ),
	};
}, { recordTracksEvent } )( localize( PaidPlanThankYouCard ) );
