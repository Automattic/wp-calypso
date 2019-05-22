/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import { parse as parseUrl } from 'url';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteFileModDisableReason } from 'lib/site/utils';
import { isJetpackSiteMainNetworkSite, isJetpackSiteMultiSite } from 'state/sites/selectors';
import { SETTING_UP_PREMIUM_SERVICES } from 'lib/url/support';
import Button from 'components/button';
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import ProgressBar from 'components/progress-bar';
import ThankYouCard from './thank-you-card';

const INSTALL_STATE_COMPLETE = 1;
const INSTALL_STATE_UNCOMPLETE = 2;

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
			installState,
			isSiteMainNetworkSite,
			isSiteMultiSite,
			siteSlug,
			translate,
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
				>
					<p>{ translate( "Unfortunately, we can't modify files on your site, so you'll need to set up your plan features manually." ) }</p>
					<p>{ translate( "Don't worry. We'll quickly guide you through the setup process." ) }</p>
					<p>
						<Button primary href={ SETTING_UP_PREMIUM_SERVICES } target="_blank">
							{ translate( 'Set up features' ) }
						</Button>
					</p>
				</ThankYouCard>
			);
		}

		if ( isSiteMultiSite && ! isSiteMainNetworkSite ) {
			return (
				<ThankYouCard
					illustration={ fireworksIllustration }
					title={ translate( 'Thank you for your purchase!' ) }
				>
					<p>{ translate( "Unfortunately, your site is part of a multi-site network, but is not the main network site. You'll need to set up your plan features manually." ) }</p>
					<p>{ translate( "Don't worry. We'll quickly guide you through the setup process." ) }</p>
					<p>
						<Button primary href={ SETTING_UP_PREMIUM_SERVICES } target="_blank">
							{ translate( 'Set up features' ) }
						</Button>
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
							<a href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Hide message' ) }</a>
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
			</Fragment>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	const installProgress = getJetpackProductInstallProgress( state, siteId );

	let installState;
	// @TODO we'll need a way to detect generic error states here and add `INSTALL_STATE_ERRORED`
	if ( installProgress === 100 ) {
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
		siteSlug: getSelectedSiteSlug( state ),
	};
}, { recordTracksEvent } )( localize( PaidPlanThankYouCard ) );
