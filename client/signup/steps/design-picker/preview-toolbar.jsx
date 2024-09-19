import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { computer, tablet, phone } from '../../icons';
import './preview-toolbar.scss';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

const DesignPickerPreviewToolbar = ( {
	device: currentDevice,
	externalUrl,
	showDeviceSwitcher,
	setDeviceViewport,
	translate,
	showSiteAddressBar = true,
	devicesToShow,
} ) => {
	const devices = React.useRef( {
		computer: { title: translate( 'Desktop' ), icon: computer, iconSize: 36 },
		tablet: { title: translate( 'Tablet' ), icon: tablet, iconSize: 24 },
		phone: { title: translate( 'Phone' ), icon: phone, iconSize: 24 },
	} );

	function filterDevices( selectedDevices ) {
		// If invalid inputs, display all possible devices
		// If at least one valid input, Will filter out any devices that do not exist in the 'possibleDevices' array above
		let filteredPossibleDevices = [];
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
				<div className="preview-toolbar__browser-header">
					<svg width="40" height="8">
						<g>
							<rect width="8" height="8" rx="4" />
							<rect x="16" width="8" height="8" rx="4" />
							<rect x="32" width="8" height="8" rx="4" />
						</g>
					</svg>
					{ externalUrl && <span className="preview-toolbar__browser-url">{ externalUrl }</span> }
				</div>
			) }
		</div>
	);
};

DesignPickerPreviewToolbar.propTypes = {
	// The device to display, used for setting preview dimensions
	device: PropTypes.string,
	// The site URL
	externalUrl: PropTypes.string,
	// Show device viewport switcher
	showDeviceSwitcher: PropTypes.bool,
	// Called when a device button is clicked
	setDeviceViewport: PropTypes.func,
	// Show iframe site address bar
	showSiteAddressBar: PropTypes.bool,
	// Filter devices to show in device switcher
	devicesToShow: PropTypes.array,
};

export default localize( DesignPickerPreviewToolbar );
