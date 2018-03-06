/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { overSome, partial } from 'lodash';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import ClipboardButtonInput from 'components/clipboard-button-input';
import { isBusiness, isEnterprise, isJetpackPremium } from 'lib/products-values';
import { userCan } from 'lib/site/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

const hasSeoSupportingPlan = overSome( isBusiness, isEnterprise, isJetpackPremium );

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
		showSEO: true,
	};

	handleEditorWebPreviewExternalClick = () => {
		this.props.recordTracksEvent( 'calypso_editor_preview_toolbar_external_click' );
	};

	handleEditorWebPreviewClose = () => {
		this.props.recordTracksEvent( 'calypso_editor_preview_close_click' );
		this.props.onClose();
	};

	handleEditorWebPreviewEdit = () => {
		this.props.recordTracksEvent( 'calypso_editor_preview_edit_click' );
		this.props.onEdit();
	};

	constructor( props ) {
		super();

		this.devices = {
			computer: { title: props.translate( 'Desktop' ), icon: 'computer' },
			tablet: { title: props.translate( 'Tablet' ), icon: 'tablet' },
			phone: { title: props.translate( 'Phone' ), icon: 'phone' },
			seo: { title: props.translate( 'Search & Social' ), icon: 'globe' },
		};
	}

	render() {
		const {
			device: currentDevice,
			editUrl,
			externalUrl,
			isModalWindow,
			previewUrl,
			setDeviceViewport,
			showClose,
			showDeviceSwitcher,
			showUrl,
			showEdit,
			showExternal,
			showSEO,
			translate,
		} = this.props;

		const selectedDevice = this.devices[ currentDevice ];
		const devicesToShow = showSEO ? possibleDevices.concat( 'seo' ) : possibleDevices;

		return (
			<div className="web-preview__toolbar">
				{ showClose && (
					<Button
						borderless
						aria-label={ translate( 'Close preview' ) }
						className="web-preview__close"
						data-tip-target="web-preview__close"
						onClick={ this.handleEditorWebPreviewClose }
					>
						{ translate( 'Close' ) }
					</Button>
				) }
				{ showDeviceSwitcher && (
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
								e2eTitle={ device }
							>
								{ this.devices[ device ].title }
							</DropdownItem>
						) ) }
					</SelectDropdown>
				) }
				{ showUrl && (
					<ClipboardButtonInput
						className="web-preview__url-clipboard-input"
						value={ externalUrl || previewUrl }
						hideHttp
					/>
				) }
				<div className="web-preview__toolbar-actions">
					{ showEdit && (
						<Button
							className="web-preview__edit"
							href={ editUrl }
							onClick={ this.handleEditorWebPreviewEdit }
						>
							{ translate( 'Edit' ) }
						</Button>
					) }
					{ showExternal && (
						<Button
							primary
							className="web-preview__external"
							href={ externalUrl || previewUrl }
							target={ isModalWindow ? '_blank' : null }
							rel="noopener noreferrer"
							onClick={ this.handleEditorWebPreviewExternalClick }
						>
							{ translate( 'Visit Site' ) }
						</Button>
					) }
					<div className="web-preview__toolbar-tray">{ this.props.children }</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { showSEO } ) => {
	const site = getSelectedSite( state );
	const supportsSEO = site && site.plan && hasSeoSupportingPlan( site.plan );
	const userCanManageSite = userCan( 'manage_options', site );

	return {
		showSEO: showSEO && ( supportsSEO || userCanManageSite ),
	};
};

export default connect( mapStateToProps, {
	recordTracksEvent,
} )( localize( PreviewToolbar ) );
