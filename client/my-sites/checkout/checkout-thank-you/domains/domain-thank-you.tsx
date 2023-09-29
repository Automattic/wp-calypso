/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button, Gridicon } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { translate } from 'i18n-calypso';
import { useMemo, useEffect, useCallback } from 'react';
import * as React from 'react';
import { ThankYou } from 'calypso/components/thank-you';
import WordPressLogo from 'calypso/components/wordpress-logo';
import domainThankYouContent from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content';
import {
	DomainThankYouProps,
	DomainThankYouType,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { useActivityPubStatus } from 'calypso/state/activitypub/use-activitypub-status';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { verifyIcannEmail } from 'calypso/state/domains/management/actions';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import QuerySiteDomains from '../../../../components/data/query-site-domains';

import './style.scss';

interface DomainThankYouContainerProps {
	domain: string;
	email: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
	selectedSiteSlug: string;
	type: DomainThankYouType;
	isDomainOnly: boolean;
	selectedSiteId?: number;
	isUserEmailVerified: boolean;
}

const DomainThankYou: React.FC< DomainThankYouContainerProps > = ( {
	domain,
	email,
	hasProfessionalEmail,
	selectedSiteSlug,
	hideProfessionalEmailStep,
	type,
	isDomainOnly,
	selectedSiteId,
	isUserEmailVerified,
} ) => {
	const dispatch = useDispatch();
	const {
		data: { is_enabled: isLaunchpadIntentBuildEnabled },
	} = useLaunchpad( selectedSiteSlug, 'intent-build' );
	const launchpadScreen = useSiteOption( 'launchpad_screen' );
	const redirectTo = isLaunchpadIntentBuildEnabled ? 'home' : 'setup';
	const siteIntent = useSiteOption( 'site_intent' );
	const { isEnabled: isActivityPubEnabled } = useActivityPubStatus( selectedSiteSlug );

	const siteDomain = useSelector(
		( state ) =>
			getDomainsBySiteId( state, selectedSiteId )?.find(
				( siteDomain ) => siteDomain.domain === domain
			)
	);

	const isPendingIcannVerification = siteDomain?.isPendingIcannVerification;

	const shouldDisplayVerifyEmailStep = ! isUserEmailVerified || isPendingIcannVerification;

	const onResendEmailVerificationClick = useCallback( () => {
		if ( isPendingIcannVerification ) {
			dispatch( verifyIcannEmail( domain ) );
		} else {
			dispatch( verifyEmail( { showGlobalNotices: true } ) );
		}
	}, [ dispatch, domain, isPendingIcannVerification ] );

	const isDomainOnlySiteOption = useSelector(
		( state ) =>
			selectedSiteId !== undefined && Boolean( isDomainOnlySite( state, selectedSiteId ) )
	);
	const thankYouProps = useMemo< DomainThankYouProps >( () => {
		const propsGetter = domainThankYouContent[ type ];
		return propsGetter( {
			selectedSiteSlug,
			domain,
			email,
			shouldDisplayVerifyEmailStep,
			onResendEmailVerificationClick,
			hasProfessionalEmail,
			hideProfessionalEmailStep,
			siteIntent,
			launchpadScreen,
			redirectTo,
			isDomainOnly: isDomainOnly && isDomainOnlySiteOption,
			selectedSiteId,
			isActivityPubEnabled,
		} );
	}, [
		type,
		domain,
		selectedSiteSlug,
		email,
		shouldDisplayVerifyEmailStep,
		onResendEmailVerificationClick,
		hasProfessionalEmail,
		hideProfessionalEmailStep,
		siteIntent,
		launchpadScreen,
		redirectTo,
		isDomainOnly,
		selectedSiteId,
		isDomainOnlySiteOption,
		isActivityPubEnabled,
	] );

	const isLaunchpadEnabled = launchpadScreen === 'full';

	useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	const renderHeader = (
		isLaunchpadEnabled: boolean,
		siteIntent: string,
		redirectTo: 'home' | 'setup'
	) => {
		const buttonProps = isLaunchpadEnabled
			? {
					onClick: () => {
						const redirectUrl =
							redirectTo === 'home'
								? `/home/${ selectedSiteSlug }`
								: `/setup/${ siteIntent }/launchpad?siteSlug=${ selectedSiteSlug }`;
						window.location.replace( redirectUrl );
					},
			  }
			: { href: domainManagementRoot() };
		return (
			<div className="checkout-thank-you__domains-header">
				<WordPressLogo className="checkout-thank-you__domains-header-logo" size={ 24 } />
				<Button borderless { ...buttonProps }>
					<Gridicon icon="chevron-left" size={ 18 } />
					<span>
						{ isLaunchpadEnabled ? translate( 'Next Steps' ) : translate( 'All domains' ) }
					</span>
				</Button>
			</div>
		);
	};

	return (
		<>
			{ renderHeader( isLaunchpadEnabled, siteIntent as string, redirectTo ) }
			<ThankYou
				headerBackgroundColor="var( --studio-white )"
				containerClassName="checkout-thank-you__domains"
				sections={ thankYouProps.sections }
				showSupportSection={ ! isLaunchpadEnabled }
				thankYouImage={ thankYouProps.thankYouImage }
				thankYouTitle={ thankYouProps.thankYouTitle }
				thankYouSubtitle={ thankYouProps.thankYouSubtitle }
				thankYouNotice={ thankYouProps.thankYouNotice }
			/>
			<QuerySiteDomains siteId={ selectedSiteId as number } />
		</>
	);
};

export default DomainThankYou;
