import { useTranslate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ReactNode } from 'react';

interface Props {
	section: string;
}

export default function ScanNavigation( { section }: Props ) {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();

	if ( ! site ) {
		return <SectionNav />;
	}

	const strings: Record< string, ReactNode > = {
		scanner: translate( 'Scanner' ),
		history: translate( 'History' ),
	};
	const selectedText = strings[ section ];

	return (
		<SectionNav selectedText={ selectedText }>
			<NavTabs>
				<NavItem path={ `/scan/${ site.slug }` } selected={ section === 'scanner' }>
					{ strings.scanner }
				</NavItem>
				<NavItem path={ `/scan/history/${ site.slug }` } selected={ section === 'history' }>
					{ strings.history }
				</NavItem>
			</NavTabs>
		</SectionNav>
	);
}
