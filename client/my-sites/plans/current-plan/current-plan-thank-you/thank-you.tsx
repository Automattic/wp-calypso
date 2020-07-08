/**
 * External dependencies
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';
import { connect, DefaultRootState } from 'react-redux';
import { isDesktop } from '@automattic/viewport';
import { localize, LocalizeProps, TranslateResult } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
import { settingsPath } from 'lib/jetpack/paths';
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

const mapStateToProps = ( state: DefaultRootState ) => {
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
};

const mapDispatchToProps = { recordTracksEvent, requestGuidedTour };

export type ThankYouCtaType = React.FC< {
	dismissUrl: string;
	recordThankYouClick: ( productName: string, value?: string ) => void;
} >;

type ExternalProps = {
	children: ReactElement;
	illustration?: string;
	ThankYouCtaComponent?: ThankYouCtaType;
	showCalypsoIntro?: boolean;
	showContinueButton?: boolean;
	showHideMessage?: boolean;
	showSearchRedirects?: boolean;
	showScanCTAs?: boolean;
	title?: TranslateResult;
};

type Props = ReturnType< typeof mapStateToProps > &
	typeof mapDispatchToProps &
	LocalizeProps &
	ExternalProps;

export const ThankYouCard: FC< Props > = ( {
	children,
	ThankYouCtaComponent,
	currentRoute,
	illustration,
	queryArgs,
	recordTracksEvent: dispatchRecordTracksEvent,
	requestGuidedTour: dispatchRequestGuidedTour,
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
} ) => {
	const startChecklistTour = useCallback( () => {
		if ( isDesktop() ) {
			dispatchRequestGuidedTour( 'jetpackChecklistTour' );
		}
	}, [ dispatchRequestGuidedTour ] );

	const dismissUrl = useMemo(
		() =>
			queryArgs && 'install' in queryArgs
				? addQueryArgs( { install: queryArgs.install }, currentRoute )
				: currentRoute,
		[ currentRoute, queryArgs ]
	);
	const recordThankYouClick = useCallback(
		( productName, value ) => {
			dispatchRecordTracksEvent( 'calypso_jetpack_product_thankyou', {
				product_name: productName,
				value,
				site: 'jetpack',
			} );
		},
		[ dispatchRecordTracksEvent ]
	);

	const jetpackVersion = useMemo( () => get( selectedSite, 'options.jetpack_version', 0 ), [
		selectedSite,
	] );

	if ( ! siteAdminUrl ) {
		return null;
	}

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
					<Button href={ dismissUrl } onClick={ startChecklistTour } primary>
						{ translate( 'Continue' ) }
					</Button>
				) }
				{ showHideMessage && (
					<p>
						<a
							href={ dismissUrl }
							className="current-plan-thank-you__link"
							onClick={ startChecklistTour }
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
							onClick={ () => recordThankYouClick( 'search', 'customizer' ) }
						>
							{ jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
								? translate( 'Update Jetpack' )
								: translate( 'Try Search and customize it now' ) }
						</Button>
					</p>
				) }
				{ showScanCTAs && (
					<p className="current-plan-thank-you__followup">
						<Button href={ `${ settingsPath( selectedSiteSlug ) }#credentials` } primary>
							{ translate( 'Add server credentials now' ) }
						</Button>
						<Button href={ dismissUrl } onClick={ startChecklistTour }>
							{ translate( 'See checklist' ) }
						</Button>
					</p>
				) }
				{ ThankYouCtaComponent && (
					<p className="current-plan-thank-you__followup">
						<ThankYouCtaComponent
							dismissUrl={ dismissUrl }
							recordThankYouClick={ recordThankYouClick }
						/>
					</p>
				) }
			</div>
		</div>
	);
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ThankYouCard ) );
