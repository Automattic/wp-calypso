import { Button, Gridicon, SelectDropdown } from '@automattic/components';
import { getThemeIdFromStylesheet } from '@automattic/data-stores';
import { Spinner } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { installTheme } from 'calypso/state/themes/actions';
import { suffixThemeIdForInstall } from 'calypso/state/themes/actions/suffix-theme-id-for-install';
import { getIsLivePreviewSupported, getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const possibleDevices = [ 'computer', 'tablet', 'phone' ];

class PreviewToolbar extends Component {
	state = {
		isRedirecting: false,
	};

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
		installTheme: PropTypes.func,
		isAtomic: PropTypes.bool,
		isLivePreviewSupported: PropTypes.bool,
		siteEditorUrl: PropTypes.string,
		themeInstallId: PropTypes.string,
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

	handleEditorWebPreviewEditHeader = async ( event ) => {
		event.preventDefault();
		this.setState( { isRedirecting: true } );

		this.props.recordTracksEvent( 'calypso_editor_preview_edit_header_click' );

		const { isAtomic, selectedSiteId, siteEditorUrl, themeInstallId } = this.props;

		// For atomic sites, we need to install theme before navigating to site editor
		// If theme is already installed, installation will silently fail, and we just switch to the site-editor.
		try {
			if ( isAtomic ) {
				await this.props.installTheme( themeInstallId, selectedSiteId );
			}
			window.location.href = siteEditorUrl;
		} catch ( error ) {
			this.setState( { isRedirecting: false } );
		}
	};

	render() {
		const {
			canUserEditThemeOptions,
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
			showEditHeaderLink,
			translate,
			isUnlaunchedSite,
			isLivePreviewSupported,
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
					{ showEditHeaderLink && canUserEditThemeOptions && isLivePreviewSupported && (
						<Button
							borderless
							aria-label={ translate( 'Try and customize' ) }
							className={
								this.state.isRedirecting
									? 'web-preview__loading-spinner'
									: 'web-preview__edit-header-link'
							}
							onClick={ this.handleEditorWebPreviewEditHeader }
							disabled={ this.state.isRedirecting }
						>
							{ this.state.isRedirecting ? (
								<Spinner size={ 16 } />
							) : (
								translate( 'Try and customize' )
							) }
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
	( state, ownProps ) => {
		const currentUser = getCurrentUser( state );
		const selectedSiteId = getSelectedSiteId( state );
		const isSingleSite = !! selectedSiteId || currentUser?.site_count === 1;
		const siteId = selectedSiteId || ( isSingleSite && getPrimarySiteId( state ) ) || null;
		const canUserEditThemeOptions = canCurrentUser( state, siteId, 'edit_theme_options' );
		const theme = getTheme( state, 'wpcom', ownProps.themeId );
		const isAtomic = isSiteAtomic( state, siteId );

		const themePreviewId = isAtomic
			? getThemeIdFromStylesheet( theme?.stylesheet )
			: theme?.stylesheet;

		const themeInstallId = isAtomic
			? suffixThemeIdForInstall( state, selectedSiteId, ownProps.themeId )
			: null;

		const dashboardLink = `${ window.location.pathname }${ window.location.search }`.replace(
			/^\/+/,
			'/'
		);

		const siteEditorUrl = getSiteEditorUrl( state, siteId, {
			wp_theme_preview: themePreviewId,
			wpcom_dashboard_link: dashboardLink,
		} );

		return {
			canUserEditThemeOptions,
			isUnlaunchedSite: getIsUnlaunchedSite( state, siteId ),
			selectedSiteId,
			siteEditorUrl,
			isAtomic,
			themeInstallId,
			isLivePreviewSupported: getIsLivePreviewSupported( state, ownProps.themeId, siteId ),
		};
	},
	{ recordTracksEvent, installTheme }
)( localize( PreviewToolbar ) );
