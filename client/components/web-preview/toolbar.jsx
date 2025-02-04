import { Button, Gridicon, SelectDropdown } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getCustomizerUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

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
		// Show edit the header link button
		showEditHeaderLink: PropTypes.bool,
		// The URL for the selected site's customizer
		customizeUrl: PropTypes.string,
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
		// Whether or not the current user has access to the customizer
		canUserEditThemeOptions: PropTypes.bool,
		isUnlaunchedSite: PropTypes.bool,
		selectedSiteId: PropTypes.number,
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

	handleEditorWebPreviewEditHeader = ( event ) => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_editor_preview_edit_header_click' );
		window.location.href = this.props.customizeUrl;
	};

	render() {
		const {
			canUserEditThemeOptions,
			device: currentDevice,
			customizeUrl,
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
			showEditHeaderLink,
			translate,
			isUnlaunchedSite,
		} = this.props;

		const devices = {
			computer: { title: translate( 'Desktop' ), icon: 'computer' },
			tablet: { title: translate( 'Tablet' ), icon: 'tablet' },
			phone: { title: translate( 'Phone' ), icon: 'phone' },
			seo: { title: translate( 'Search & Social' ), icon: 'globe' },
		};

		const selectedDevice = devices[ currentDevice ];
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
						{ devicesToShow.map( ( device ) => (
							<SelectDropdown.Item
								key={ device }
								selected={ device === currentDevice }
								onClick={ () => setDeviceViewport( device ) }
								icon={ <Gridicon size={ 18 } icon={ devices[ device ].icon } /> }
								e2eTitle={ device }
							>
								{ devices[ device ].title }
							</SelectDropdown.Item>
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
					{ showEditHeaderLink && canUserEditThemeOptions && (
						<Button
							borderless
							aria-label={ translate( 'Customize' ) }
							className="web-preview__edit-header-link"
							href={ customizeUrl }
							onClick={ this.handleEditorWebPreviewEditHeader }
						>
							{ translate( 'Customize' ) }
						</Button>
					) }
					{ showExternal && (
						<>
							<Button
								primary={ ! isUnlaunchedSite }
								className="web-preview__external"
								href={ externalUrl || previewUrl }
								target={ isModalWindow ? '_blank' : null }
								rel="noopener noreferrer"
								onClick={ this.handleEditorWebPreviewExternalClick }
							>
								{ translate( 'Visit site' ) }
							</Button>
						</>
					) }
					{ this.props.children }
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const currentUser = getCurrentUser( state );
		const selectedSiteId = getSelectedSiteId( state );
		const isSingleSite = !! selectedSiteId || currentUser?.site_count === 1;
		const siteId = selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
		const canUserEditThemeOptions = canCurrentUser( state, siteId, 'edit_theme_options' );

		return {
			canUserEditThemeOptions,
			customizeUrl: getCustomizerUrl( state, siteId, null, window.location.href ),
			isUnlaunchedSite: getIsUnlaunchedSite( state, siteId ),
			selectedSiteId,
		};
	},
	{ recordTracksEvent }
)( localize( PreviewToolbar ) );
