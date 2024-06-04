import './style.scss';

interface NavMenuProps {
	navItems: {
		label: string;
	}[];
	ctaText?: string;
	ctaUrl?: string;
}

export const NavMenu = ( { navItems, ctaText, ctaUrl }: NavMenuProps ) => {
	return (
		<nav className="site-profiler-nav-menu">
			<ul>
				{ navItems.map( ( navItem, index ) => (
					<li>
						0{ index + 1 }. { navItem.label }
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
