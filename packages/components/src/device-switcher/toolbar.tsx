import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useRef } from 'react';
import { DEVICES_SUPPORTED, DEVICE_TYPES } from './constants';
import { computer, tablet, phone } from './icons';
import type { Device } from './types';
import './toolbar.scss';

interface ToolbarProps {
	device: Device;
	onDeviceClick: ( device: Device ) => void;
}

const DeviceSwitcherToolbar = ( { device: currentDevice, onDeviceClick }: ToolbarProps ) => {
	const devices = useRef( {
		[ DEVICE_TYPES.COMPUTER ]: { title: translate( 'Desktop' ), icon: computer, iconSize: 36 },
		[ DEVICE_TYPES.TABLET ]: { title: translate( 'Tablet' ), icon: tablet, iconSize: 24 },
		[ DEVICE_TYPES.PHONE ]: { title: translate( 'Phone' ), icon: phone, iconSize: 24 },
	} );

	return (
		<div className="device-switcher__toolbar">
			<div className="device-switcher__toolbar-devices">
				{ DEVICES_SUPPORTED.map( ( device ) => (
					<Button
						key={ device }
						aria-label={ devices.current[ device ].title }
						className={ classnames( {
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
			</div>
		</div>
	);
};

export default DeviceSwitcherToolbar;
