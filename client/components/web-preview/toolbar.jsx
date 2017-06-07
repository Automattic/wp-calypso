/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { partial } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';

const possibleDevices = [
	'computer',
	'tablet',
	'phone'
];

class PreviewToolbar extends Component {
	static propTypes = {
		// Show device viewport switcher
		showDeviceSwitcher: PropTypes.bool,
		// Show external link button
		showExternal: PropTypes.bool,
		// Show close button
		showClose: PropTypes.bool,
		// Show SEO button
		showSEO: PropTypes.bool,
		// The device to display, used for setting preview dimensions
		device: PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: PropTypes.node,
		// Called when a device button is clicked
		setDeviceViewport: PropTypes.func,
		// Called when the close button is pressed
		onClose: PropTypes.func.isRequired,
	};

	static defaultProps = {
		showSEO: true
	};

	constructor( props ) {
		super();

		this.devices = {
			computer: { title: props.translate( 'Desktop' ), icon: 'computer' },
			tablet: { title: props.translate( 'Tablet' ), icon: 'tablet' },
			phone: { title: props.translate( 'Phone' ), icon: 'phone' },
			seo: { title: props.translate( 'Search & Social' ), icon: 'globe' }
		};
	}

	render() {
		const {
			device: currentDevice,
			externalUrl,
			onClose,
			previewUrl,
			setDeviceViewport,
			showClose,
			showDeviceSwitcher,
			showExternal,
			showSEO,
			translate
		} = this.props;

		const selectedDevice = this.devices[ currentDevice ];
		const devicesToShow = showSEO ? possibleDevices.concat( 'seo' ) : possibleDevices;

		return (
			<div className="web-preview__toolbar">
				{ showClose &&
					<button
						aria-label={ translate( 'Close preview' ) }
						className="web-preview__close"
						data-tip-target="web-preview__close"
						onClick={ onClose }
					>
						<Gridicon icon="cross" />
					</button>
				}
				{ showDeviceSwitcher &&
					<SelectDropdown
						compact
						className="web-preview__device-switcher"
						selectedText={ selectedDevice.title }
						selectedIcon={ selectedDevice.icon }
					>
						{ devicesToShow.map( device => (
							<DropdownItem
								key={ device }
								selected={ device === currentDevice }
								onClick={ partial( setDeviceViewport, device ) }
							>
								{ this.devices[ device ].title }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				}
				{ showExternal &&
					<a
						className="web-preview__external"
						href={ externalUrl || previewUrl }
						target="_blank"
						rel="noopener noreferrer"
					>
						<Gridicon icon="external" />
					</a>
				}
				<div className="web-preview__toolbar-tray">
					{ this.props.children }
				</div>
			</div>
		);
	}
}

export default localize( PreviewToolbar );
