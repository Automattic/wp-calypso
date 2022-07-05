import { Button } from '@automattic/components';
import { STICKY_OFFSET_TOP } from '@automattic/design-picker';
import { Icon } from '@wordpress/icons';
// import { ColorPalette } from '@wordpress/components';
import { ColorPalette } from '@automattic/onboarding';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import { findIndex } from 'lodash';
import { computer, tablet, phone } from 'calypso/signup/icons';
import './preview-toolbar.scss';

const possibleDevices = [ 'computer', 'tablet', 'phone' ] as const;

type Device = typeof possibleDevices[ number ];

type PreviewToolbarProps = {
	// The device to display, used for setting preview dimensions
	device: Device;
	// The site URL
	externalUrl: string;
	// Show device viewport switcher
	showDeviceSwitcher: boolean;
	// Whether to sticky
	isSticky?: boolean;
	// Called when a device button is clicked
	setDeviceViewport: ( device: Device ) => void;
	palettes: ColorPalette.Color[];
	onPaletteChange: ( color: string | undefined, index: number ) => void;
	translate: ( word: string ) => string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const DesignPickerPreviewToolbar = ( {
	device: currentDevice,
	externalUrl,
	showDeviceSwitcher,
	isSticky,
	setDeviceViewport,
	translate,
	palettes,
	onPaletteChange,
}: PreviewToolbarProps ) => {
	const devices = React.useRef( {
		computer: { title: translate( 'Desktop' ), icon: computer, iconSize: 36 },
		tablet: { title: translate( 'Tablet' ), icon: tablet, iconSize: 24 },
		phone: { title: translate( 'Phone' ), icon: phone, iconSize: 24 },
	} );
	const [ stickyStyle, setStickyStyle ] = useState( {} );
	const headerRef = useRef< HTMLDivElement >( null );
	const headerContentRef = useRef< HTMLDivElement >( null );

	console.log( 'DesignPickerPreviewToolbar', palettes );

	useEffect( () => {
		if ( ! isSticky ) {
			setStickyStyle( {} );
			return noop;
		}

		const handleSticky = () => {
			if ( ! headerRef.current || ! headerContentRef.current ) {
				return;
			}

			const { left } = headerRef.current.getBoundingClientRect();

			setStickyStyle( {
				position: 'fixed',
				// Align with the sticky thumbnails
				top: `${ STICKY_OFFSET_TOP }px`,
				left: `${ left }px`,
				height: `${ headerRef.current.offsetHeight }px`,
				width: `${ headerRef.current.offsetWidth }px`,
			} );
		};

		handleSticky();

		window.addEventListener( 'resize', handleSticky );

		return () => {
			window.removeEventListener( 'resize', handleSticky );
		};
	}, [ isSticky, setStickyStyle ] );

	return (
		<div className="preview-toolbar__toolbar">
			{ showDeviceSwitcher && (
				<div className="preview-toolbar__devices">
					{ possibleDevices.map( ( device ) => (
						<Button
							key={ device }
							borderless
							aria-label={ devices.current[ device ].title }
							className={ classNames( 'preview-toolbar__button', {
								'is-selected': device === currentDevice,
							} ) }
							onClick={ () => setDeviceViewport( device ) }
						>
							<Icon
								size={ devices.current[ device ].iconSize }
								icon={ devices.current[ device ].icon }
							/>
						</Button>
					) ) }
				</div>
			) }
			<div className="preview-toolbar__browser-header" ref={ headerRef }>
				<div
					className="preview-toolbar__browser-header-content"
					style={ stickyStyle }
					ref={ headerContentRef }
				>
					<svg width="40" height="8">
						<g>
							<rect width="8" height="8" rx="4" />
							<rect x="16" width="8" height="8" rx="4" />
							<rect x="32" width="8" height="8" rx="4" />
						</g>
					</svg>
					{ externalUrl && <span className="preview-toolbar__browser-url">{ externalUrl }</span> }
					<div>
						<ColorPalette name={ 'Proba' } />
						{ /*<ColorPalette
							clearable={ false }
							disableCustomColors={ true }
							colors={ palettes }
							value={ '' }
							onChange={ ( color ) => {
								const index = findIndex( palettes, ( o ) => o.color === color )
								onPaletteChange( color, index );
							} }
						/>*/ }
					</div>
				</div>
			</div>
		</div>
	);
};

export default localize( DesignPickerPreviewToolbar );
