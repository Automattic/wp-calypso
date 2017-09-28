/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { clone, map, omit, partial } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormInputCheckbox from 'components/forms/form-checkbox';

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

	state = {
		showingSEO: false,
	};

	constructor( props ) {
		super();

		this.devices = {
			responsive: { title: props.translate( 'Responsive' ), icon: 'computer' },
			computer: { title: props.translate( 'Desktop' ), icon: 'computer' },
			tablet: { title: props.translate( 'Tablet' ), icon: 'tablet' },
			phone: { title: props.translate( 'Phone' ), icon: 'phone' },
		};
	}

	toggleSEO = () => this.setState( {
		showingSEO: ! this.state.showingSEO,
	} );

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
			switcherLimitedToResponsive,
			translate
		} = this.props;
console.log(this.state.showingSEO);
		const selectedDevice = clone( this.devices[ currentDevice ] );
		if ( switcherLimitedToResponsive && currentDevice === 'computer' ) {
			selectedDevice.title = translate( 'Responsive' );
		}

		const shownDevices = showDeviceSwitcher && switcherLimitedToResponsive
			? [ this.devices.responsive ]
			: omit( this.devices, 'responsive' );

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
						{ map( shownDevices, ( device, deviceName ) => (
							<DropdownItem
								key={ deviceName }
								selected={ deviceName === currentDevice }
								onClick={ partial( setDeviceViewport, deviceName ) }
								icon={ <Gridicon size={ 18 } icon={ device.icon } /> }
							>
								{ device.title }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				}
				{ showSEO &&
					( [
						<Gridicon icon="globe" size={ 24 } />,
						<div className="web-preview__seo-label"> {
							translate( 'Search & Social' )
						} </div>,
						<FormInputCheckbox
							title={ translate( 'Search & Social' ) }
							className="web-preview__seo-checkbox"
							onChange={ this.toggleSEO } />
					] ) }
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
