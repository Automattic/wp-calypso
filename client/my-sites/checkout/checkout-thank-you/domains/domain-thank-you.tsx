/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useMemo, useEffect } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { ThankYou } from 'calypso/components/thank-you';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useLaunchpad } from 'calypso/data/sites/use-launchpad';
import domainThankYouContent from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content';
import {
	DomainThankYouProps,
	DomainThankYouType,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';

import './style.scss';

interface DomainThankYouContainerProps {
	domain: string;
	email: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
	selectedSiteSlug: string;
	type: DomainThankYouType;
}

const DomainThankYou: React.FC< DomainThankYouContainerProps > = ( {
	domain,
	email,
	hasProfessionalEmail,
	selectedSiteSlug,
	hideProfessionalEmailStep,
	type,
} ) => {
	const {
		data: { launchpad_screen: launchpadScreen, site_intent: siteIntent },
	} = useLaunchpad( selectedSiteSlug );

	const thankYouProps = useMemo< DomainThankYouProps >( () => {
		const propsGetter = domainThankYouContent[ type ];
		return propsGetter( {
			selectedSiteSlug,
			domain,
			email,
			hasProfessionalEmail,
			hideProfessionalEmailStep,
			siteIntent,
			launchpadScreen,
		} );
	}, [
		type,
		domain,
		selectedSiteSlug,
		email,
		hasProfessionalEmail,
		hideProfessionalEmailStep,
		siteIntent,
		launchpadScreen,
	] );
	const dispatch = useDispatch();
	const isLaunchpadEnabled = launchpadScreen === 'full';

	useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	const renderHeader = ( isLaunchpadEnabled: boolean, siteIntent: string ) => {
		const buttonProps = isLaunchpadEnabled
			? {
					onClick: () =>
						window.location.replace(
							`/setup/${ siteIntent }/launchpad?siteSlug=${ selectedSiteSlug }`
						),
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
			{ renderHeader( isLaunchpadEnabled, siteIntent as string ) }
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
		</>
	);
};

export default DomainThankYou;
