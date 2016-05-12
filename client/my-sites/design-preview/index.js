/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import * as PreviewActions from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import layoutFocus from 'lib/layout-focus';
import { getSelectedSiteId } from 'state/ui/selectors';

const debug = debugFactory( 'calypso:design-preview' );

const DesignPreview = React.createClass( {

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
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object,
		actions: React.PropTypes.object,
		isUnsaved: React.PropTypes.bool,
		selectedSiteId: React.PropTypes.number,
	},

	getDefaultProps() {
		return {
			showPreview: false,
			defaultViewportDevice: 'tablet',
			showClose: true,
			customizations: {},
			actions: {},
			isUnsaved: false,
			onLoad: noop,
		};
	},

	componentDidMount() {
		this.loadPreview();
	},

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
		if ( this.props.selectedSiteId && this.props.actions.fetchPreviewMarkup ) {
			debug( 'loading preview with customizations', this.props.customizations );
			this.props.actions.fetchPreviewMarkup( this.props.selectedSiteId, '', this.props.customizations );
		}
	},

	undoCustomization() {
		if ( this.props.actions.undoCustomization ) {
			this.props.actions.undoCustomization( this.props.selectedSiteId );
		}
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
					if ( this.props.actions.clearCustomizations ) {
						this.props.actions.clearCustomizations( this.props.selectedSiteId );
					}
					layoutFocus.set( 'sidebar' );
				}
			} );
		}
		if ( this.props.actions.clearCustomizations ) {
			this.props.actions.clearCustomizations( this.props.selectedSiteId );
		}
		layoutFocus.set( 'sidebar' );
	},

	onPreviewClick( event ) {
		debug( 'click detected for element', event.target );
		if ( ! event.target.href ) {
			return;
		}
		event.preventDefault();
		// TODO: if the href is on the current site, load the href as a preview and fetch markup for that url
	},

	render() {
		return (
			<WebPreview
				className={ this.props.className }
				showExternal={ false }
				showClose={ this.props.showClose }
				showPreview={ this.props.showPreview }
				defaultViewportDevice={ this.props.defaultViewportDevice }
				previewMarkup={ this.props.previewMarkup }
				onClose={ this.onClosePreview }
				onLoad={ this.onLoad }
			>
			{ this.props.children }
			</WebPreview>
		);
	}
} );

function mapStateToProps( state ) {
	const selectedSiteId = getSelectedSiteId( state );
	if ( ! state.preview || ! state.preview[ selectedSiteId ] ) {
		return { selectedSiteId };
	}
	const { previewMarkup, customizations, isUnsaved } = state.preview[ selectedSiteId ];
	return {
		selectedSiteId,
		previewMarkup,
		customizations,
		isUnsaved,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( PreviewActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignPreview );
