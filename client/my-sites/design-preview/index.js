/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import WebPreview from 'components/web-preview';
import { clearPreviewUrl } from 'state/ui/actions';
import { fetchPreviewMarkup, undoCustomization, clearCustomizations } from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import layoutFocus from 'lib/layout-focus';
import { getSelectedSite, getSelectedSiteId, getPreviewUrl } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getPreviewMarkup, getPreviewCustomizations, isPreviewUnsaved } from 'state/preview/selectors';
import addQueryArgs from 'lib/route/add-query-args';

const debug = debugFactory( 'calypso:design-preview' );

const DesignPreview = React.createClass( {
	previewCounter: 0,

	propTypes: {
		// Any additional classNames to set on this wrapper
		className: React.PropTypes.string,
		// True to show the preview; same as WebPreview.
		showPreview: React.PropTypes.bool,
		// The viewport device to show initially; same as WebPreview but defaults to 'tablet'.
		defaultViewportDevice: React.PropTypes.string,
		// Show close button; same as WebPreview.
		showClose: React.PropTypes.bool,
		// Elements to render on the right side of the toolbar; same as WebPreview.
		children: React.PropTypes.node,
		// A function to run when the preview has loaded. Will be passed a ref to the iframe document object.
		onLoad: React.PropTypes.func,
		// These are all provided by the state
		selectedSiteUrl: React.PropTypes.string,
		selectedSiteNonce: React.PropTypes.string,
		selectedSite: React.PropTypes.object,
		selectedSiteId: React.PropTypes.number,
		previewUrl: React.PropTypes.string,
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object,
		isUnsaved: React.PropTypes.bool,
		fetchPreviewMarkup: React.PropTypes.func.isRequired,
		undoCustomization: React.PropTypes.func.isRequired,
		clearCustomizations: React.PropTypes.func.isRequired,
		clearPreviewUrl: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			previewCount: 0
		};
	},

	getDefaultProps() {
		return {
			showPreview: false,
			defaultViewportDevice: 'tablet',
			showClose: true,
			customizations: {},
			isUnsaved: false,
			onLoad: noop,
			previewUrl: null,
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! config.isEnabled( 'preview-endpoint' ) ) {
			if ( this.props.selectedSiteId && this.props.selectedSiteId !== nextProps.selectedSiteId ) {
				this.previewCounter = 0;
			}

			if ( ! this.props.showPreview && nextProps.showPreview ) {
				debug( 'forcing refresh' );
				this.previewCounter > 0 && this.setState( { previewCount: this.previewCounter } );
				this.previewCounter += 1;
			}
		}
	},

	componentDidMount() {
		this.loadPreview();
	},

	componentDidUpdate( prevProps ) {
		if ( ! config.isEnabled( 'preview-endpoint' ) ) {
			return;
		}

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
		if ( this.props.customizations && this.previewDocument ) {
			debug( 'updating preview with customizations', this.props.customizations );
			updatePreviewWithChanges( this.previewDocument, this.props.customizations );
		}
	},

	haveCustomizationsBeenRemoved( prevProps ) {
		return ( this.props.previewMarkup &&
			this.props.customizations &&
			this.props.previewMarkup === prevProps.previewMarkup &&
			prevProps.customizations &&
			Object.keys( this.props.customizations ).length === 0 &&
			Object.keys( prevProps.customizations ).length > 0
		);
	},

	loadPreview() {
		if ( ! config.isEnabled( 'preview-endpoint' ) || ! this.props.selectedSite ) {
			return;
		}
		debug( 'loading preview with customizations', this.props.customizations );
		this.props.fetchPreviewMarkup( this.props.selectedSiteId, this.props.previewUrl, this.props.customizations );
	},

	undoCustomization() {
		this.props.undoCustomization( this.props.selectedSiteId );
	},

	onLoad( previewDocument ) {
		this.previewDocument = previewDocument;
		previewDocument.body.onclick = this.onPreviewClick;
		this.props.onLoad( previewDocument );
	},

	onClosePreview() {
		if ( this.props.customizations && this.props.isUnsaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.clearPreviewUrl( this.props.selectedSiteId );
					this.props.clearCustomizations( this.props.selectedSiteId );
					layoutFocus.set( 'sidebar' );
				}
			} );
		}
		this.props.clearPreviewUrl( this.props.selectedSiteId );
		this.props.clearCustomizations( this.props.selectedSiteId );
		layoutFocus.set( 'sidebar' );
	},

	onPreviewClick( event ) {
		debug( 'click detected for element', event.target );
		if ( ! event.target.href ) {
			return;
		}
		event.preventDefault();
	},

	getPreviewUrl() {
		if ( ! this.props.selectedSiteUrl && ! this.props.previewUrl ) {
			debug( 'no preview url and no site url were found for this site' );
			return null;
		}
		const previewUrl = addQueryArgs( {
			iframe: true,
			theme_preview: true,
			'frame-nonce': this.props.selectedSiteNonce,
			cachebust: this.state.previewCount,
		}, this.getBasePreviewUrl() );
		debug( 'using this preview url', previewUrl );
		return previewUrl;
	},

	getBasePreviewUrl() {
		return this.props.previewUrl || this.props.selectedSiteUrl;
	},

	render() {
		const useEndpoint = config.isEnabled( 'preview-endpoint' );

		if ( ! this.props.selectedSite || ! this.props.selectedSite.is_previewable ) {
			debug( 'a preview is not available for this site' );
			return null;
		}

		return (
			<WebPreview
				className={ this.props.className }
				previewUrl={ useEndpoint ? null : this.getPreviewUrl() }
				externalUrl={ this.getBasePreviewUrl() }
				showExternal={ true }
				showClose={ this.props.showClose }
				showPreview={ this.props.showPreview }
				defaultViewportDevice={ this.props.defaultViewportDevice }
				previewMarkup={ useEndpoint ? this.props.previewMarkup : null }
				onClose={ this.onClosePreview }
				onLoad={ useEndpoint ? this.onLoad : noop }
			>
				{ this.props.children }
			</WebPreview>
		);
	}
} );

function mapStateToProps( state ) {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSite,
		selectedSiteId,
		selectedSiteUrl: getSiteOption( state, selectedSiteId, 'unmapped_url' ),
		selectedSiteNonce: getSiteOption( state, selectedSiteId, 'frame_nonce' ),
		previewUrl: getPreviewUrl( state ),
		previewMarkup: getPreviewMarkup( state, selectedSiteId ),
		customizations: getPreviewCustomizations( state, selectedSiteId ),
		isUnsaved: isPreviewUnsaved( state, selectedSiteId ),
	};
}

export default connect(
	mapStateToProps,
	{ fetchPreviewMarkup, undoCustomization, clearCustomizations, clearPreviewUrl }
)( DesignPreview );
