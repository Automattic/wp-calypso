import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import './preview-toolbar.scss';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

const DesignPickerPreviewToolbar = ( {
	device: currentDevice,
	externalUrl,
	setDeviceViewport,
	translate,
} ) => {
	const devices = React.useRef( {
		computer: { title: translate( 'Desktop' ), icon: 'computer' },
		tablet: { title: translate( 'Tablet' ), icon: 'tablet' },
		phone: { title: translate( 'Phone' ), icon: 'phone' },
	} );

	return (
		<div className="preview-toolbar__toolbar">
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
						<Gridicon size={ 18 } icon={ devices.current[ device ].icon } />
					</Button>
				) ) }
			</div>
			<div className="preview-toolbar__browser-header">
				<svg width="40" height="8">
					<g>
						<rect width="8" height="8" rx="4" />
						<rect x="16" width="8" height="8" rx="4" />
						<rect x="32" width="8" height="8" rx="4" />
					</g>
				</svg>
				<span className="preview-toolbar__browser-url">{ externalUrl }</span>
			</div>
		</div>
	);
};

DesignPickerPreviewToolbar.propTypes = {
	// The device to display, used for setting preview dimensions
	device: PropTypes.string,
	// The site URL
	externalUrl: PropTypes.string,
	// Called when a device button is clicked
	setDeviceViewport: PropTypes.func,
};

export default localize( DesignPickerPreviewToolbar );
