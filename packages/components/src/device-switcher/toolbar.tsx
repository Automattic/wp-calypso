import { Button } from '@wordpress/components';
import { Icon, desktop, mobile, tablet } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useRef } from 'react';
import { DEVICES_SUPPORTED, DEVICE_TYPES } from './constants';
import { zoomIn, zoomOut } from './icons';
import type { Device } from './types';
import './toolbar.scss';

interface ToolbarProps {
	device: Device;
	isZoomable: boolean;
	isZoomActive: boolean;
	onDeviceClick: ( device: Device ) => void;
	onZoomClick: () => void;
}

const DeviceSwitcherToolbar = ( {
	device: currentDevice,
	isZoomable,
	isZoomActive,
	onDeviceClick,
	onZoomClick,
}: ToolbarProps ) => {
	const devices = useRef( {
		[ DEVICE_TYPES.COMPUTER ]: { title: translate( 'Desktop' ), icon: desktop, iconSize: 36 },
		[ DEVICE_TYPES.TABLET ]: { title: translate( 'Tablet' ), icon: tablet, iconSize: 36 },
		[ DEVICE_TYPES.PHONE ]: { title: translate( 'Phone' ), icon: mobile, iconSize: 36 },
	} );

	return (
		<div className="device-switcher__toolbar">
			<div className="device-switcher__toolbar-devices">
				{ DEVICES_SUPPORTED.map( ( device ) => (
					<Button
						key={ device }
						aria-label={ devices.current[ device ].title }
						className={ clsx( {
							[ device ]: true,
							'is-selected': device === currentDevice,
						} ) }
						onClick={ () => onDeviceClick( device ) }
					>
						<Icon
							icon={ devices.current[ device ].icon }
							size={ devices.current[ device ].iconSize }
						/>
					</Button>
				) ) }
				{ isZoomable && (
					<Button
						aria-label={ translate( 'Zoom out 50%' ) }
						className={ clsx( { zoom: true, 'is-selected': isZoomActive } ) }
						onClick={ () => onZoomClick() }
					>
						<Icon icon={ isZoomActive ? zoomIn : zoomOut } size={ 24 } />
					</Button>
				) }
			</div>
		</div>
	);
};

export default DeviceSwitcherToolbar;
