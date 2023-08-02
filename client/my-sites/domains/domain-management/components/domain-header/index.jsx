import { useDesktopBreakpoint } from '@automattic/viewport-react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import './style.scss';

const DomainHeader = ( { items, mobileItem, buttons = null, mobileButtons = null } ) => {
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
			<FixedNavigationHeader
				compactBreadcrumb={ ! isWide }
				navigationItems={ items }
				mobileItem={ mobileItem }
			>
				{ renderButtons() }
			</FixedNavigationHeader>
		</>
	);
};

export default DomainHeader;
