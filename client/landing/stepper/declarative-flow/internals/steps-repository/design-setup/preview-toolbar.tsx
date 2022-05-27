import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { useEffect, useRef } from 'react';
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
}: PreviewToolbarProps ) => {
	const devices = React.useRef( {
		computer: { title: translate( 'Desktop' ), icon: computer, iconSize: 36 },
		tablet: { title: translate( 'Tablet' ), icon: tablet, iconSize: 24 },
		phone: { title: translate( 'Phone' ), icon: phone, iconSize: 24 },
	} );

	const wrapperRef = useRef< HTMLDivElement >( null );
	const headerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! isSticky ) {
			wrapperRef.current?.style.removeProperty( 'height' );
			headerRef.current?.style.removeProperty( 'width' );
			headerRef.current?.style.removeProperty( 'left' );
			return noop;
		}

		const handleSticky = () => {
			if ( ! wrapperRef.current || ! headerRef.current ) {
				return;
			}

			const { left } = wrapperRef.current.getBoundingClientRect();
			wrapperRef.current?.style.setProperty( 'height', `${ headerRef.current.offsetWidth }px` );
			headerRef.current?.style.setProperty( 'width', `${ wrapperRef.current.offsetWidth }px` );
			headerRef.current?.style.setProperty( 'left', `${ left }px` );
		};

		handleSticky();

		window.addEventListener( 'resize', handleSticky );

		return () => {
			window.removeEventListener( 'resize', handleSticky );
		};
	}, [ isSticky ] );

	return (
		<div className="preview-toolbar__toolbar" ref={ wrapperRef }>
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
			<div
				className={ classNames( 'preview-toolbar__browser-header', {
					'preview-toolbar__browser-header--sticky': isSticky,
				} ) }
				ref={ headerRef }
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
	);
};

export default localize( DesignPickerPreviewToolbar );
