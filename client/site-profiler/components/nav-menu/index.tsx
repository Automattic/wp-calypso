import './style.scss';

interface NavMenuProps {
	navItems: {
		label: string;
		ref: React.RefObject< HTMLElement >;
	}[];
	ctaText?: string;
	ctaUrl?: string;
}

const executeScroll = ( ref: React.RefObject< HTMLElement > ) => {
	if ( ref.current ) {
		ref.current.scrollIntoView( { behavior: 'smooth' } );
	}
};

export const NavMenu = ( { navItems, ctaText, ctaUrl }: NavMenuProps ) => {
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
				{ ctaText && (
					<li className="site-profiler-nav-menu__cta">
						<a href={ ctaUrl }>{ ctaText }</a>
					</li>
				) }
			</ul>
		</nav>
	);
};
