import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import React from 'react';

const ICON_SIZE = 32;

type Props = {
	icon: JSX.Element;
	iconClassName?: string;
	heading: string;
	description: string | TranslateResult;
	isBanner?: boolean;
	disabled?: boolean;
	buttonProps?: React.ComponentProps< typeof Button >;
	extraContent?: JSX.Element;
};

const AddNewSiteMenuItem: React.FC< Props > = ( {
	icon,
	iconClassName,
	heading,
	description,
	isBanner,
	disabled,
	buttonProps,
	extraContent,
} ) => {
	return (
		<Button
			{ ...buttonProps }
			className={ clsx( 'add-new-site__popover-button', {
				banner: isBanner,
				disabled,
			} ) }
		>
			<div className={ clsx( 'add-new-site__popover-button-icon', iconClassName ) }>
				<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
			</div>
			<div className="add-new-site__popover-button-content">
				<div className="add-new-site__popover-button-heading">{ heading }</div>
				<div className="add-new-site__popover-button-description">{ description }</div>
				{ extraContent }
			</div>
		</Button>
	);
};

export default AddNewSiteMenuItem;
