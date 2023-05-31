import { useTranslate } from 'i18n-calypso';
import { PromoSectionCard } from 'calypso/components/promo-section';
import { redirectToLaunchpad } from 'calypso/utils';
import type { SiteSlug } from 'calypso/types';

import './style.scss';

export interface LaunchpadNavProps {
	selectedSiteSlug: SiteSlug | null;
	siteIntent: string;
}

const LaunchpadNav = ( { selectedSiteSlug, siteIntent }: LaunchpadNavProps ) => {
	const translate = useTranslate();
	const getLaunchpadCard = () => ( {
		title: translate( 'Continue setting up your site!' ),
		body: '',
		actions: {
			cta: {
				text: translate( 'Next Steps' ),
				action: () => {
					redirectToLaunchpad( selectedSiteSlug || '', siteIntent, false );
				},
			},
		},
	} );

	return (
		<PromoSectionCard
			isPrimary={ true }
			isLaunchpad={ true }
			className="earn__launchpad-nav"
			{ ...getLaunchpadCard() }
		/>
	);
};

export default LaunchpadNav;
