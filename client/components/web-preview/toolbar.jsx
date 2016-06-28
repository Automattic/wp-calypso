/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

const PreviewToolbar = React.createClass( {
	devices: [ 'computer', 'tablet', 'phone' ],

	propTypes: {
		// Show device viewport switcher
		showDeviceSwitcher: React.PropTypes.bool,
		// Show external link button
		showExternal: React.PropTypes.bool,
		// Show close button
		showClose: React.PropTypes.bool,
		// The device to display, used for setting preview dimensions
		device: React.PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: React.PropTypes.node,
		// Called when a device button is clicked
		setDeviceViewport: React.PropTypes.func,
		// Called when the close button is pressed
		onClose: React.PropTypes.func.isRequired,
	},

	renderDevices() {
		return this.devices.map( ( device ) => {
			const className = classnames( 'web-preview__device-button', {
				'is-active': this.props.device === device,
			} );

			return (
				<button
					key={ device }
					className={ className }
					onClick={ this.props.setDeviceViewport.bind( null, device ) }
					aria-hidden={ true }
				>
					<Gridicon icon={ device } />
				</button>
			);
		} );
	},

	render() {
		return (
			<div className="web-preview__toolbar">
				{ this.props.showClose &&
					<button
						className="web-preview__close"
						data-tip-target="web-preview__close"
						onClick={ this.props.onClose }
						aria-label={ this.props.translate( 'Close preview' ) }
					>
						<Gridicon icon="cross" />
					</button>
				}
				{ this.props.showExternal &&
					<a className="web-preview__external" href={ this.props.externalUrl || this.props.previewUrl } target="_blank">
						<Gridicon icon="external" />
					</a>
				}
				{ this.props.showDeviceSwitcher && this.renderDevices() }
				<div className="web-preview__toolbar-tray">
					{ this.props.children }
				</div>
			</div>
		);
	}

} );

export default localize( PreviewToolbar );
