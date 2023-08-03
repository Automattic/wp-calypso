import { useDesktopBreakpoint } from '@automattic/viewport-react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import NavigationHeader from 'calypso/components/navigation-header';
import './style.scss';

const DomainHeader = ( {
	items,
	mobileItem,
	buttons = null,
	mobileButtons = null,
	// NOTE: temp flag to test the new header design
	isRedesign2023Aug = false,
} ) => {
	const isWide = useDesktopBreakpoint();

	const renderButtons = () => (
		<>
			{ buttons && (
				<div className="domain-header__buttons">{ buttons.map( ( button ) => button ) }</div>
			) }
			{ mobileButtons && (
				<div className="domain-header__buttons-mobile">
					{ mobileButtons.map( ( button ) => button ) }
				</div>
			) }
		</>
	);

	return (
		<>
			{ isRedesign2023Aug ? (
				<NavigationHeader
					compactBreadcrumb={ ! isWide }
					navigationItems={ items }
					mobileItem={ mobileItem }
					title={ items[ items.length - 1 ].label }
					subtitle={ items[ items.length - 1 ].subtitle }
				>
					{ renderButtons() }
				</NavigationHeader>
			) : (
				<FixedNavigationHeader
					compactBreadcrumb={ ! isWide }
					navigationItems={ items }
					mobileItem={ mobileItem }
				>
					{ renderButtons() }
				</FixedNavigationHeader>
			) }
		</>
	);
};

export default DomainHeader;
