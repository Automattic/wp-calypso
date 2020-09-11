/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { getSelectedSite } from 'state/ui/selectors';

interface Props {
	section: string;
}

export default function ScanNavigation( { section }: Props ) {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();

	if ( ! site ) {
		return <SectionNav />;
	}

	const strings = {
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
