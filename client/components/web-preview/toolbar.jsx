/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { partial } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

const possibleDevices = [
	'computer',
	'tablet',
	'phone'
];

export const PreviewToolbar = props => {
	const {
		device: currentDevice,
		externalUrl,
		onClose,
		previewUrl,
		selectSeoPreview,
		setDeviceViewport,
		showClose,
		showDeviceSwitcher,
		showExternal,
		showSEO,
		translate
	} = props;

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
			{ showDeviceSwitcher &&
				<div className="web-preview__device-switcher">
					{ possibleDevices.map( device => (
						<button
							aria-hidden={ true }
							key={ device }
							className={ classNames( 'web-preview__device-button', {
								'is-active': device === currentDevice,
							} ) }
							onClick={ partial( setDeviceViewport, device ) }
						>
							<Gridicon icon={ device } />
						</button>
					) ) }
				</div>
			}
			{ showDeviceSwitcher &&
			<button
				aria-hidden={ true }
				key={ 'back-to-preview' }
				className={ classNames(
					'web-preview__device-button',
					'web-preview__back-to-preview-button',
					{ 'is-active': 'seo' !== currentDevice }
				) }
				onClick={ partial( setDeviceViewport, 'phone' ) }
			>
				<Gridicon icon="phone" />
			</button>
			}
			{ showSEO &&
				<button
					aria-label={ translate( 'Show SEO and search previews' ) }
					className={ classNames(
						'web-preview__seo-button', {
							'is-active': 'seo' === currentDevice,
							'is-showing-device-switcher': showDeviceSwitcher
						}
					) }
					onClick={ selectSeoPreview }
				>
					<Gridicon icon="globe" />
					<span className="web-preview__seo-label">
						{ translate( 'SEO' ) }
					</span>
				</button>
			}
			<div className="web-preview__toolbar-tray">
				{ props.children }
			</div>
		</div>
	);
};

PreviewToolbar.propTypes = {
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

PreviewToolbar.defaultProps = {
	showSEO: true
};

export default localize( PreviewToolbar );
