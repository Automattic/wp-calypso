import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface NavMenuProps {
	navItems: {
		label: string;
		ref: React.RefObject< HTMLElement >;
	}[];
	showMigrationCta?: boolean;
	domain: string;
}

const executeScroll = ( ref: React.RefObject< HTMLElement > ) => {
	if ( ref.current ) {
		ref.current.scrollIntoView( { behavior: 'smooth' } );
	}
};

export const NavMenu = ( { navItems, domain, showMigrationCta = false }: NavMenuProps ) => {
	const translate = useTranslate();
	const migrateUrl = `/setup/hosted-site-migration?ref=site-profiler&from=${ domain }`;

	return (
		<nav className="site-profiler-nav-menu">
			<ul>
				{ navItems.map( ( navItem, index ) => (
					<li>
						<button onClick={ () => executeScroll( navItem.ref ) }>
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
	);
};
