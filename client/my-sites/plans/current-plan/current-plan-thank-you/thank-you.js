/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { Button } from '@automattic/components';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getCurrentRoute from 'state/selectors/get-current-route';
import { addQueryArgs } from 'lib/url';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteAdminUrl, getSiteSlug } from 'state/sites/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import versionCompare from 'lib/version-compare';

import './style.scss';

export class ThankYouCard extends Component {
	startChecklistTour = () => {
		if ( isDesktop() ) {
			this.props.requestGuidedTour( 'jetpackChecklistTour' );
		}
	};

	render() {
		const {
			children,
			currentRoute,
			illustration,
			showCalypsoIntro,
			showContinueButton,
			showHideMessage,
			showSearchRedirects,
			showScanCTAs,
			siteAdminUrl,
			selectedSite,
			selectedSiteSlug,
			title,
			translate,
		} = this.props;

		const dismissUrl =
			this.props.queryArgs && 'install' in this.props.queryArgs
				? addQueryArgs( { install: this.props.queryArgs.install }, currentRoute )
				: currentRoute;

		if ( ! siteAdminUrl ) {
			return null;
		}

		const recordThankYouClick = ( value ) => {
			this.props.recordTracksEvent( 'calypso_jetpack_product_thankyou', {
				product_name: 'search',
				value,
			} );
		};

		const jetpackVersion = get( selectedSite, 'options.jetpack_version', 0 );

		return (
			<div className="current-plan-thank-you">
				{ illustration && (
					<img
						alt=""
						aria-hidden="true"
						className="current-plan-thank-you__illustration"
						src={ illustration }
					/>
				) }
				<div>
					{ title && <h1 className="current-plan-thank-you__title">{ title }</h1> }
					{ children }
					{ showCalypsoIntro && (
						<p>
							{ preventWidows(
								translate(
									'This is your new WordPress.com dashboard. You can manage your site ' +
										'here, or return to your self-hosted WordPress dashboard using the ' +
										'link at the bottom of your checklist.'
								)
							) }
						</p>
					) }
					{ showContinueButton && (
						<Button href={ dismissUrl } onClick={ this.startChecklistTour } primary>
							{ translate( 'Continue' ) }
						</Button>
					) }
					{ showHideMessage && (
						<p>
							<a
								href={ dismissUrl }
								className="current-plan-thank-you__link"
								onClick={ this.startChecklistTour }
							>
								{ translate( 'Hide message' ) }
							</a>
						</p>
					) }
					{ showSearchRedirects && (
						<p className="current-plan-thank-you__followup">
							<Button
								primary
								href={
									jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
										? siteAdminUrl + 'plugins.php'
										: siteAdminUrl + 'customize.php?autofocus[section]=jetpack_search'
								}
								onClick={ () => recordThankYouClick( 'customizer' ) }
							>
								{ jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
									? translate( 'Update Jetpack' )
									: translate( 'Try Search and customize it now' ) }
							</Button>
						</p>
					) }
					{ showScanCTAs && (
						<p className="current-plan-thank-you__followup">
							<Button href={ `/settings/security/${ selectedSiteSlug }#credentials` } primary>
								{ translate( 'Add server credentials now' ) }
							</Button>
							<Button href={ dismissUrl } onClick={ this.startChecklistTour }>
								{ translate( 'See checklist' ) }
							</Button>
						</p>
					) }
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const currentUser = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		const isSingleSite = !! selectedSiteId || currentUser.site_count === 1;
		const siteId = selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		return {
			siteAdminUrl,
			selectedSite,
			selectedSiteSlug,
			currentRoute: getCurrentRoute( state ),
			queryArgs: getCurrentQueryArguments( state ),
		};
	},
	{ recordTracksEvent, requestGuidedTour }
)( localize( ThankYouCard ) );
