import page from '@automattic/calypso-router';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import type { TranslateResult } from 'i18n-calypso';
import type { MouseEvent } from 'react';

export interface TabSpec {
	slug: string;
	title: TranslateResult;
	path: string;
}

interface SocialAuthorProfileTabsProps {
	tabs: TabSpec[];
	activeSlug: string;
	// Wrappers own protocol-specific work (Tracks event, slug ↔ filter
	// mapping). Fired only on plain-left-click of a non-active tab.
	onTabClick: ( toSlug: string, fromSlug: string ) => void;
	className?: string;
}

function isPlainLeftClick( event: MouseEvent ): boolean {
	return (
		event.button === 0 && ! event.metaKey && ! event.ctrlKey && ! event.shiftKey && ! event.altKey
	);
}

// Presentational tabs row used by every protocol's author-profile surface.
// Owns: layout, plain-vs-modifier click semantics, in-app navigation via
// page.replace. Does NOT touch Tracks — wrappers dispatch their own.
export function SocialAuthorProfileTabs( {
	tabs,
	activeSlug,
	onTabClick,
	className,
}: SocialAuthorProfileTabsProps ) {
	const selected = tabs.find( ( t ) => t.slug === activeSlug ) ?? tabs[ 0 ];

	const handleClick = ( event: MouseEvent< HTMLAnchorElement >, tab: TabSpec ) => {
		if ( ! isPlainLeftClick( event ) ) {
			return;
		}
		event.preventDefault();
		if ( tab.slug === selected.slug ) {
			return;
		}
		page.replace( tab.path );
		onTabClick( tab.slug, selected.slug );
	};

	return (
		<SectionNav
			className={ className }
			selectedText={ selected.title }
			variation="minimal"
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ tabs.map( ( tab ) => (
					<NavItem
						key={ tab.slug }
						path={ tab.path }
						selected={ tab.slug === selected.slug }
						onClick={ ( event: MouseEvent< HTMLAnchorElement > ) => handleClick( event, tab ) }
					>
						{ tab.title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
}
