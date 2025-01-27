import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';

import './style.scss';

const PopoverMenuItem = ( {
	icon,
	iconClassName,
	heading,
	description,
	buttonProps,
	extraContent,
}: {
	icon: JSX.Element;
	iconClassName?: string;
	heading: string;
	description: string | TranslateResult;
	buttonProps?: React.ComponentProps< typeof Button >;
	extraContent?: JSX.Element;
} ) => {
	return (
		<Button { ...buttonProps } className="a4a-popover__popover-button">
			<div className={ clsx( 'a4a-popover__popover-button-icon', iconClassName ) }>
				<Icon className="sidebar__menu-icon" icon={ icon } size={ 32 } />
			</div>
			<div className="a4a-popover__popover-button-content">
				<div className="a4a-popover__popover-button-heading">{ heading }</div>
				<div className="a4a-popover__popover-button-description">{ description }</div>
				{ extraContent }
			</div>
		</Button>
	);
};

export default PopoverMenuItem;
