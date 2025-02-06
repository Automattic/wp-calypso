import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { ReactNode } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';

import './style.scss';

type NavigationItem = {
	label: string;
	subtitle?: string | ReactNode;
	href?: string;
};

type DomainHeaderProps = {
	items: Array< NavigationItem >;
	mobileItem?: NavigationItem;
	buttons?: Array< ReactNode > | null;
	mobileButtons?: Array< ReactNode > | null;
	titleOverride?: ReactNode | null;
	subtitleOverride?: ReactNode | null;
};

const DomainHeader = ( {
	items,
	mobileItem,
	buttons = null,
	mobileButtons = null,
	titleOverride = null,
	subtitleOverride = null,
}: DomainHeaderProps ) => {
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
		<NavigationHeader
			compactBreadcrumb={ ! isWide }
			navigationItems={ items }
			mobileItem={ mobileItem }
			title={ titleOverride || items[ items.length - 1 ].label }
			subtitle={ subtitleOverride || items[ items.length - 1 ].subtitle }
			className="domain-header"
		>
			{ renderButtons() }
		</NavigationHeader>
	);
};

export default DomainHeader;
