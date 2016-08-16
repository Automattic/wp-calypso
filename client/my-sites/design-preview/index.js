/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { fetchPreviewMarkup, undoCustomization } from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getPreviewUrl } from 'state/ui/preview/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getPreviewMarkup, getPreviewCustomizations, isPreviewUnsaved } from 'state/preview/selectors';
import { closePreview } from 'state/ui/preview/actions';

const debug = debugFactory( 'calypso:design-preview' );

export default function designPreview( WebPreview ) {
	class DesignPreview extends React.Component {
		constructor( props ) {
			super( props );
			this.getCustomizations = this.getCustomizations.bind( this );
			this.haveCustomizationsBeenRemoved = this.haveCustomizationsBeenRemoved.bind( this );
			this.loadPreview = this.loadPreview.bind( this );
			this.undoCustomization = this.undoCustomization.bind( this );
			this.onLoad = this.onLoad.bind( this );
			this.onClosePreview = this.onClosePreview.bind( this );
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
			// Apply customizations
			if ( this.getCustomizations() && this.previewDocument ) {
				debug( 'updating preview with customizations', this.getCustomizations() );
				updatePreviewWithChanges( this.previewDocument, this.getCustomizations() );
			}
		}

		getCustomizations() {
			return this.props.customizations || {};
		}

		haveCustomizationsBeenRemoved( prevProps ) {
			return ( this.props.previewMarkup &&
				this.getCustomizations() &&
				this.props.previewMarkup === prevProps.previewMarkup &&
				prevProps.customizations &&
				Object.keys( this.getCustomizations() ).length === 0 &&
				Object.keys( prevProps.customizations ).length > 0
			);
		}

		loadPreview() {
			if ( ! this.props.selectedSite ) {
				return;
			}
			debug( 'loading preview with customizations', this.getCustomizations() );
			this.props.fetchPreviewMarkup( this.props.selectedSiteId, this.props.previewUrl, this.getCustomizations() );
		}

		undoCustomization() {
			this.props.undoCustomization( this.props.selectedSiteId );
		}

		onLoad( previewDocument ) {
			this.previewDocument = previewDocument;
			previewDocument.body.onclick = this.onPreviewClick;
		}

		onClosePreview() {
			if ( this.getCustomizations() && this.props.isUnsaved ) {
				return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
					if ( accepted ) {
						this.props.closePreview();
					}
				} );
			}
			this.props.closePreview();
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

			return (
				<WebPreview
					className={ this.props.className }
					showPreview={ this.props.showPreview }
					showExternal={ false }
					showClose={ false }
					previewMarkup={ this.props.previewMarkup }
					onClose={ this.onClosePreview }
					onLoad={ this.onLoad }
					/>
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
	};

	function mapStateToProps( state ) {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSite,
			selectedSiteId,
			selectedSiteUrl: getSiteOption( state, selectedSiteId, 'unmapped_url' ),
			previewUrl: getPreviewUrl( state ),
			previewMarkup: getPreviewMarkup( state, selectedSiteId ),
			customizations: getPreviewCustomizations( state, selectedSiteId ),
			isUnsaved: isPreviewUnsaved( state, selectedSiteId ),
		};
	}

	return connect(
		mapStateToProps,
		{ fetchPreviewMarkup, undoCustomization, closePreview }
	)( DesignPreview );
}
