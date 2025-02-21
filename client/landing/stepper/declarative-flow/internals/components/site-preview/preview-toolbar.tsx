import { Button } from '@automattic/components';
import { STICKY_OFFSET_TOP } from '@automattic/design-picker';
import { Icon, desktop, mobile, tablet } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import './preview-toolbar.scss';

const possibleDevices = [ 'computer', 'tablet', 'phone' ] as const;

type Device = ( typeof possibleDevices )[ number ];

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
	translate: ( word: string ) => string;
	// Show iframe site address bar
	showSiteAddressBar?: boolean;
	// Filter devices to show in device switcher
	devicesToShow?: Device[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const PreviewToolbar = ( {
	device: currentDevice,
	externalUrl,
	showDeviceSwitcher,
	isSticky,
	setDeviceViewport,
	translate,
	showSiteAddressBar = true,
	devicesToShow,
}: PreviewToolbarProps ) => {
	const devices = React.useRef( {
		computer: { title: translate( 'Desktop' ), icon: desktop, iconSize: 24 },
		tablet: { title: translate( 'Tablet' ), icon: tablet, iconSize: 24 },
		phone: { title: translate( 'Phone' ), icon: mobile, iconSize: 24 },
	} );

	const [ stickyStyle, setStickyStyle ] = useState( {} );
	const headerRef = useRef< HTMLDivElement >( null );
	const headerContentRef = useRef< HTMLDivElement >( null );

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

	function filterDevices( selectedDevices: Device[] | undefined ) {
		// If invalid inputs, display all possible devices
		// If at least one valid input, Will filter out any devices that do not exist in the 'possibleDevices' array above
		let filteredPossibleDevices: Device[] = [];
		if ( Array.isArray( selectedDevices ) && selectedDevices.length > 0 ) {
			filteredPossibleDevices = selectedDevices.filter( ( device ) => {
				return possibleDevices.includes( device );
			} );
		}
		return filteredPossibleDevices.length === 0 ? possibleDevices : filteredPossibleDevices;
	}

	const filteredPossibleDevices = filterDevices( devicesToShow );

	return (
		<div className="preview-toolbar__toolbar">
			{ showDeviceSwitcher && (
				<div className="preview-toolbar__devices">
					{ filteredPossibleDevices.map( ( device ) => (
						<Button
							key={ device }
							borderless
							aria-label={ devices.current[ device ].title }
							className={ clsx( 'preview-toolbar__button', {
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
			{ showSiteAddressBar && (
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
					</div>
				</div>
			) }
		</div>
	);
};

export default localize( PreviewToolbar );
