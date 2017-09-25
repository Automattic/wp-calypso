/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { partial } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ClipboardButtonInput from 'components/clipboard-button-input';
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
		// Show external link with clipboard input
		showUrl: PropTypes.bool,
		// Show external link button
		showExternal: PropTypes.bool,
		// Show close button
		showClose: PropTypes.bool,
		// Show SEO button
		showSEO: PropTypes.bool,
		// Show edit button
		showEdit: PropTypes.bool,
		// The URL for the edit button
		editUrl: PropTypes.string,
		// The device to display, used for setting preview dimensions
		device: PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: PropTypes.node,
		// Called when a device button is clicked
		setDeviceViewport: PropTypes.func,
		// Called when the close button is pressed
		onClose: PropTypes.func.isRequired,
		// Called when the edit button is clicked
		onEdit: PropTypes.func,
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
			editUrl,
			externalUrl,
			isModalWindow,
			onClose,
			onEdit,
			previewUrl,
			setDeviceViewport,
			showClose,
			showDeviceSwitcher,
			showUrl,
			showEdit,
			showExternal,
			showSEO,
			translate
		} = this.props;

		const selectedDevice = this.devices[ currentDevice ];
		const devicesToShow = showSEO ? possibleDevices.concat( 'seo' ) : possibleDevices;

		return (
			<div className="web-preview__toolbar">
				{ showClose &&
					<Button
						borderless
						aria-label={ translate( 'Close preview' ) }
						className="web-preview__close"
						data-tip-target="web-preview__close"
						onClick={ onClose }
					>
						<Gridicon icon={ isModalWindow ? 'cross' : 'arrow-left' } />
					</Button>
				}
				{ showDeviceSwitcher &&
					<SelectDropdown
						compact
						className="web-preview__device-switcher"
						selectedText={ selectedDevice.title }
						selectedIcon={ <Gridicon size={ 18 } icon={ selectedDevice.icon } /> }
						ref={ this.setDropdown }
					>
						{ devicesToShow.map( device => (
							<DropdownItem
								key={ device }
								selected={ device === currentDevice }
								onClick={ partial( setDeviceViewport, device ) }
								icon={ <Gridicon size={ 18 } icon={ this.devices[ device ].icon } /> }
							>
								{ this.devices[ device ].title }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				}
				{ showUrl &&
					<ClipboardButtonInput
						className="web-preview__url-clipboard-input"
						value={ externalUrl || previewUrl }
						hideHttp
					/>
				}
				<div className="web-preview__toolbar-actions">
					{ showEdit &&
						<Button
							borderless
							className="web-preview__edit"
							href={ editUrl }
							onClick={ onEdit }
						>
							<Gridicon icon="pencil" /> { translate( 'Edit' ) }
						</Button>
					}
					{ showExternal &&
						<Button
							borderless
							className="web-preview__external"
							href={ externalUrl || previewUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							<Gridicon icon="external" />
						</Button>
					}
					<div className="web-preview__toolbar-tray">
						{ this.props.children }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( PreviewToolbar );
