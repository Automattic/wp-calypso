import { useDesktopBreakpoint } from '@automattic/viewport-react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import './domain-header.scss';

const DomainHeader = ( { items, buttons, mobileButtons } ) => {
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
			<FixedNavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ items }>
				{ renderButtons() }
			</FixedNavigationHeader>
			<div className="domain-header__spacer"></div>
		</>
	);
};

export default DomainHeader;
