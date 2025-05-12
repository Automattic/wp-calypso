import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import StickyPanel from 'calypso/components/sticky-panel';
import { useIsMenuSectionVisible } from 'calypso/site-profiler/hooks/use-is-menu-section-visible';
import './style.scss';

interface NavMenuProps {
	navItems: {
		label: string;
		ref: React.RefObject< HTMLObjectElement >;
	}[];
	showMigrationCta?: boolean;
	domain: string;
}

const executeScroll = ( ref: React.RefObject< HTMLObjectElement > ) => {
	if ( ref.current ) {
		ref.current.scrollIntoView( { behavior: 'smooth' } );
	}
};

export const NavMenu = ( { navItems, domain, showMigrationCta = false }: NavMenuProps ) => {
	const translate = useTranslate();
	const migrateUrl = `/setup/site-migration?ref=site-profiler&from=${ domain }`;

	/* eslint-disable react-hooks/rules-of-hooks */
	// Using map() instead of findIndex() here avoids "Rendered fewer hooks than expected" errors
	const activeIndexes = navItems.map( ( navItem ) => useIsMenuSectionVisible( navItem.ref ) );
	const activeIndex = activeIndexes.indexOf( true );

	return (
		<StickyPanel minLimit={ 0 }>
			<nav className="site-profiler-nav-menu">
				<ul>
					{ navItems.map( ( navItem, index ) => (
						<li>
							<button
								className={ clsx( { active: index === activeIndex } ) }
								onClick={ () => executeScroll( navItem.ref ) }
							>
								0{ index + 1 }. { navItem.label }
							</button>
						</li>
					) ) }
					{ showMigrationCta && (
						<li className="site-profiler-nav-menu__cta">
							<a href={ migrateUrl }>{ translate( 'Request migration - It’s free' ) }</a>
						</li>
					) }
				</ul>
			</nav>
		</StickyPanel>
	);
};
