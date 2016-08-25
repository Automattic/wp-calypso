/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import page from 'page';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { fetchPreviewMarkup, undoCustomization } from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getPreviewUrl } from 'state/ui/preview/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getPreviewMarkup, getPreviewCustomizations, isPreviewUnsaved } from 'state/preview/selectors';
import { closePreview } from 'state/ui/preview/actions';
import DesignMenu from 'blocks/design-menu';
import { getSiteFragment } from 'lib/route/path';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const debug = debugFactory( 'calypso:design-preview' );

export default function designPreview( WebPreview ) {
	class DesignPreview extends React.Component {
		constructor( props ) {
			super( props );
			this.shouldReloadPreview = this.shouldReloadPreview.bind( this );
			this.haveCustomizationsBeenRemoved = this.haveCustomizationsBeenRemoved.bind( this );
			this.loadPreview = this.loadPreview.bind( this );
			this.undoCustomization = this.undoCustomization.bind( this );
			this.onLoad = this.onLoad.bind( this );
			this.onClosePreview = this.onClosePreview.bind( this );
			this.cleanAndClosePreview = this.cleanAndClosePreview.bind( this );
			this.onPreviewClick = this.onPreviewClick.bind( this );
		}

		componentDidMount() {
			this.loadPreview();
		}

		componentDidUpdate( prevProps ) {
			// If there is no markup or the site has changed, fetch it
			if ( ! this.props.previewMarkup || this.props.selectedSiteId !== prevProps.selectedSiteId ) {
				this.loadPreview();
			}
			// Refresh the preview when it is being shown (since this component is
			// always present but not always visible, this is similar to loading the
			// preview when mounting).
			if ( this.props.showPreview && ! prevProps.showPreview ) {
				this.loadPreview();
			}
			// If the customizations have been removed, restore the original markup
			if ( this.haveCustomizationsBeenRemoved( prevProps ) ) {
				// Force the initial markup to be restored because the DOM may have been
				// changed, and simply not applying customizations will not restore it.
				debug( 'restoring original markup' );
				this.loadPreview();
			}
			// Certain customizations cannot be applied by DOM changes, in which case we
			// can reload the preview.
			if ( this.shouldReloadPreview( prevProps ) ) {
				debug( 'reloading preview due to customizations' );
				this.loadPreview();
			}
			// Apply customizations as DOM changes
			if ( this.props.customizations && this.previewDocument ) {
				debug( 'updating preview with customizations', this.props.customizations );
				updatePreviewWithChanges( this.previewDocument, this.props.customizations );
			}
		}

		shouldReloadPreview( prevProps ) {
			const customizations = this.props.customizations;
			const prevCustomizations = prevProps.customizations || {};
			return ( JSON.stringify( customizations.homePage ) !==
				JSON.stringify( prevCustomizations.homePage ) );
		}

		haveCustomizationsBeenRemoved( prevProps ) {
			return ( this.props.previewMarkup &&
				this.props.customizations &&
				this.props.previewMarkup === prevProps.previewMarkup &&
				prevProps.customizations &&
				Object.keys( this.props.customizations ).length === 0 &&
				Object.keys( prevProps.customizations ).length > 0
			);
		}

		loadPreview() {
			if ( ! this.props.selectedSite ) {
				return;
			}
			debug( 'loading preview with customizations', this.props.customizations );
			this.props.fetchPreviewMarkup( this.props.selectedSiteId, this.props.previewUrl, this.props.customizations );
		}

		undoCustomization() {
			this.props.undoCustomization( this.props.selectedSiteId );
		}

		onLoad( previewDocument ) {
			this.previewDocument = previewDocument;
			previewDocument.body.onclick = this.onPreviewClick;
		}

		onClosePreview() {
			if ( this.props.customizations && this.props.isUnsaved ) {
				const unsavedMessage =
					this.props.translate( 'You have unsaved changes. Are you sure you want to close the preview?' );
				return accept( unsavedMessage, accepted => {
					if ( accepted ) {
						this.cleanAndClosePreview();
					}
				} );
			}
			this.cleanAndClosePreview();
		}

		cleanAndClosePreview() {
			this.props.closePreview();
			const siteFragment = getSiteFragment( page.current );
			const isEmptyRoute = includes( page.current, '/customize' ) || includes( page.current, '/paladin' );
			// If this route has nothing but the preview, redirect to somewhere else
			if ( isEmptyRoute ) {
				page.redirect( `/stats/${siteFragment}` );
			}
		}

		onPreviewClick( event ) {
			debug( 'click detected for element', event.target );
			if ( ! event.target.href ) {
				return;
			}
			event.preventDefault();
		}

		render() {
			if ( ! this.props.selectedSite || ! this.props.selectedSite.is_previewable ) {
				debug( 'a preview is not available for this site' );
				return null;
			}
			const showSidebar = () => this.props.setLayoutFocus( 'preview-sidebar' );

			return (
				<div>
					<DesignMenu isVisible={ this.props.showPreview } />
					<WebPreview
						className={ this.props.className }
						showPreview={ this.props.showPreview }
						showExternal={ false }
						showClose={ false }
						hasSidebar={ true }
						previewMarkup={ this.props.previewMarkup }
						onClose={ this.onClosePreview }
						onLoad={ this.onLoad }
					>
						<button
							className="design-preview__mobile-show-sidebar"
							onClick={ showSidebar }
						>
							<Gridicon icon="arrow-left" />
							<span className="design-preview__mobile-show-sidebar-label">
								{ this.props.translate( 'EDIT' ) }
							</span>
						</button>
					</WebPreview>
				</div>
			);
		}
	}

	DesignPreview.propTypes = {
		className: PropTypes.string,
		showPreview: PropTypes.bool,
		customizations: PropTypes.object,
		isUnsaved: PropTypes.bool,
		previewMarkup: PropTypes.string,
		previewUrl: PropTypes.string,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		undoCustomization: PropTypes.func.isRequired,
		fetchPreviewMarkup: PropTypes.func.isRequired,
		closePreview: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
	};

	DesignPreview.defaultProps = {
		customizations: {},
	};

	function mapStateToProps( state ) {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const currentLayoutFocus = getCurrentLayoutFocus( state );

		return {
			selectedSite,
			selectedSiteId,
			selectedSiteUrl: getSiteOption( state, selectedSiteId, 'unmapped_url' ),
			previewUrl: getPreviewUrl( state ),
			previewMarkup: getPreviewMarkup( state, selectedSiteId ),
			customizations: getPreviewCustomizations( state, selectedSiteId ),
			isUnsaved: isPreviewUnsaved( state, selectedSiteId ),
			showPreview: currentLayoutFocus === 'preview' || currentLayoutFocus === 'preview-sidebar',
		};
	}

	return connect(
		mapStateToProps,
		{ fetchPreviewMarkup, undoCustomization, closePreview, setLayoutFocus }
	)( localize( DesignPreview ) );
}
