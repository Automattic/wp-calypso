import { Popover, Gridicon, Button, WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon, navigation } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import A4ALogo from '../a4a-logo';

import './style.scss';

const ICON_SIZE = 32;

export default function SiteSelectorAndImporter() {
	const translate = useTranslate();

	const [ isMenuVisible, setMenuVisible ] = useState( false );

	const toggleMenu = ( isMenuVisible: boolean ) => {
		setMenuVisible( isMenuVisible );
	};

	const popoverMenuContext = useRef( null );

	const buttonContent = ( {
		icon,
		iconClassName,
		heading,
		description,
	}: {
		icon: JSX.Element;
		iconClassName?: string;
		heading: string;
		description: string;
	} ) => {
		return (
			<div className="site-selector-and-importer__popover-button">
				<div className={ clsx( 'site-selector-and-importer__popover-button-icon', iconClassName ) }>
					<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
				</div>
				<div className="site-selector-and-importer__popover-button-content">
					<div className="site-selector-and-importer__popover-button-heading">{ heading }</div>
					<div className="site-selector-and-importer__popover-button-description">
						{ description }
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			<Button
				className="site-selector-and-importer__button"
				ref={ popoverMenuContext }
				onClick={ () => toggleMenu( true ) }
			>
				{ translate( 'Add sites' ) }
				<Gridicon icon={ isMenuVisible ? 'chevron-up' : 'chevron-down' } />
			</Button>
			<Popover
				className="site-selector-and-importer__popover"
				context={ popoverMenuContext?.current }
				position="bottom right"
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ () => toggleMenu( false ) }
			>
				<div className="site-selector-and-importer__popover-content">
					<div className="site-selector-and-importer__popover-column">
						<div className="site-selector-and-importer__popover-column-heading">
							{ translate( 'Import existing sites' ).toUpperCase() }
						</div>

						{ buttonContent( {
							icon: <WordPressLogo />,
							heading: translate( 'Via WordPress.com' ),
							description: translate( 'Import sites bought on WordPress.com' ),
						} ) }
						{ buttonContent( {
							icon: <A4ALogo />,
							heading: translate( 'Via the Automattic plugin' ),
							description: translate( 'Connect with the Automattic for Agencies plugin' ),
						} ) }
						{ buttonContent( {
							icon: <JetpackLogo />,
							heading: translate( 'Via Jetpack' ),
							description: translate( 'Import one or more Jetpack connected sites' ),
						} ) }
						{ buttonContent( {
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
						{ buttonContent( {
							icon: <img src={ pressableIcon } alt="" />,
							heading: translate( 'Pressable' ),
							description: translate( 'Optimized and hassle-free hosting for business websites' ),
						} ) }
						{ buttonContent( {
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
