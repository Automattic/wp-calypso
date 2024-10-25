import { WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ReactNode } from 'react';

interface Props {
	section: string;
	showHistory?: boolean;
}

export default function ScanNavigation( { section }: Props ) {
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );
	const translate = useTranslate();

	if ( ! site ) {
		return <SectionNav />;
	}

	const strings: Record< string, ReactNode > = {
		scanner: translate( 'Scanner' ),
		history: translate( 'History' ),
		firewall: translate( 'Firewall' ),
	};
	const selectedText = strings[ section ];

	return (
		<SectionNav selectedText={ selectedText }>
			<NavTabs>
				<NavItem path={ `/scan/${ site.slug }` } selected={ section === 'scanner' }>
					{ strings.scanner }
				</NavItem>
				{ hasScan && (
					<NavItem path={ `/scan/history/${ site.slug }` } selected={ section === 'history' }>
						{ strings.history }
					</NavItem>
				) }
				<NavItem path={ `/scan/firewall/${ site.slug }` } selected={ section === 'firewall' }>
					{ strings.firewall }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
}
