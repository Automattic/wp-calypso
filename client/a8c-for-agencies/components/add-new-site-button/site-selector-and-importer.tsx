import { Popover, Gridicon, Button, WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon, navigation } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import A4ALogo from '../a4a-logo';

import './style.scss';

const ICON_SIZE = 32;

export default function SiteSelectorAndImporter( {
	showMainButtonLabel,
}: {
	showMainButtonLabel: boolean;
} ) {
	const translate = useTranslate();

	const [ isMenuVisible, setMenuVisible ] = useState( false );

	const toggleMenu = () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	};

	const popoverMenuContext = useRef( null );

	const menuItem = ( {
		icon,
		iconClassName,
		heading,
		description,
		buttonProps,
	}: {
		icon: JSX.Element;
		iconClassName?: string;
		heading: string;
		description: string;
		buttonProps?: React.ComponentProps< typeof Button >;
	} ) => {
		return (
			<Button { ...buttonProps } className="site-selector-and-importer__popover-button" borderless>
				<div className={ clsx( 'site-selector-and-importer__popover-button-icon', iconClassName ) }>
					<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
				</div>
				<div className="site-selector-and-importer__popover-button-content">
					<div className="site-selector-and-importer__popover-button-heading">{ heading }</div>
					<div className="site-selector-and-importer__popover-button-description">
						{ description }
					</div>
				</div>
			</Button>
		);
	};

	const chevronIcon = isMenuVisible ? 'chevron-up' : 'chevron-down';

	return (
		<>
			<Button
				className="site-selector-and-importer__button"
				ref={ popoverMenuContext }
				onClick={ toggleMenu }
			>
				{ showMainButtonLabel ? translate( 'Add sites' ) : null }
				<Gridicon icon={ showMainButtonLabel ? chevronIcon : 'plus' } />
			</Button>
			<Popover
				className="site-selector-and-importer__popover"
				context={ popoverMenuContext?.current }
				position="bottom right"
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ toggleMenu }
			>
				<div className="site-selector-and-importer__popover-content">
					<div className="site-selector-and-importer__popover-column">
						<div className="site-selector-and-importer__popover-column-heading">
							{ translate( 'Import existing sites' ).toUpperCase() }
						</div>
						{ menuItem( {
							icon: <WordPressLogo />,
							heading: translate( 'Via WordPress.com' ),
							description: translate( 'Import sites bought on WordPress.com' ),
						} ) }
						{ menuItem( {
							icon: <A4ALogo />,
							heading: translate( 'Via the Automattic plugin' ),
							description: translate( 'Connect with the Automattic for Agencies plugin' ),
						} ) }
						{ menuItem( {
							icon: <JetpackLogo />,
							heading: translate( 'Via Jetpack' ),
							description: translate( 'Import one or more Jetpack connected sites' ),
						} ) }
						{ menuItem( {
							icon: navigation,
							iconClassName: 'site-selector-and-importer__popover-button-wp-icon',
							heading: translate( 'Via URL' ),
							description: translate( 'Type in the address of your site' ),
						} ) }
					</div>
					<div className="site-selector-and-importer__popover-column">
						<div className="site-selector-and-importer__popover-column-heading">
							{ translate( 'Add a new site' ).toUpperCase() }
						</div>
						{ menuItem( {
							icon: <img src={ pressableIcon } alt="" />,
							heading: translate( 'Pressable' ),
							description: translate( 'Optimized and hassle-free hosting for business websites' ),
						} ) }
						{ menuItem( {
							icon: <WordPressLogo />,
							heading: translate( 'WordPress.com' ),
							description: translate( 'Best for large-scale businesses and major eCommerce sites' ),
						} ) }
					</div>
				</div>
			</Popover>
		</>
	);
}
