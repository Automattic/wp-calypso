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
import Button from 'components/button';
import WebPreview from 'components/web-preview';
import * as PreviewActions from 'state/preview/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/design-preview';
import layoutFocus from 'lib/layout-focus';

const debug = debugFactory( 'calypso:design-preview' );

const DesignPreview = React.createClass( {

	propTypes: {
		className: React.PropTypes.string,
		showPreview: React.PropTypes.bool,
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object,
		actions: React.PropTypes.object,
		isCustomizationsSaved: React.PropTypes.bool,
		onLoad: React.PropTypes.func,
		selectedSiteId: React.PropTypes.number,
	},

	getDefaultProps() {
		return {
			customizations: {},
			actions: {},
			isCustomizationsSaved: true,
			onLoad: noop,
		};
	},

	componentDidMount() {
		if ( this.props.selectedSiteId && this.props.actions.fetchPreviewMarkup ) {
			this.props.actions.fetchPreviewMarkup( this.props.selectedSiteId, '' );
		}
	},

	componentDidUpdate( prevProps ) {
		// If the customizations have been removed, restore the original markup
		if ( this.props.previewMarkup && this.props.customizations && this.props.previewMarkup === prevProps.previewMarkup && prevProps.customizations ) {
			if ( Object.keys( this.props.customizations ).length === 0 && Object.keys( prevProps.customizations ).length > 0 ) {
				debug( 'restoring original markup' );
				// Force the initial markup to be restored because the DOM may have been
				// changed, and simply not applying customizations will not restore it.
				if ( this.props.selectedSiteId && this.props.actions.fetchPreviewMarkup ) {
					this.props.actions.fetchPreviewMarkup( this.props.selectedSiteId, '' );
				}
			}
		}
		// Apply customizations
		if ( this.props.customizations && this.previewDocument ) {
			debug( 'updating preview with customizations', this.props.customizations );
			updatePreviewWithChanges( this.previewDocument, this.props.customizations, this.reloadPreview );
		}
	},

	reloadPreview() {
		if ( this.props.selectedSiteId && this.props.actions.fetchPreviewMarkup ) {
			debug( 'reloading preview with customizations', this.props.customizations );
			this.props.actions.fetchPreviewMarkup( this.props.selectedSiteId, '', this.props.customizations );
		}
	},

	undoCustomization() {
		if ( this.props.actions.undoCustomization ) {
			this.props.actions.undoCustomization();
		}
	},

	onLoad( previewDocument ) {
		this.previewDocument = previewDocument;
		previewDocument.body.onclick = this.onPreviewClick;
		this.props.onLoad( previewDocument );
	},

	onClosePreview() {
		if ( this.props.customizations && ! this.props.isCustomizationsSaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					if ( this.props.actions.clearCustomizations ) {
						this.props.actions.clearCustomizations();
					}
					layoutFocus.set( 'sidebar' );
				}
			} );
		}
		if ( this.props.actions.clearCustomizations ) {
			this.props.actions.clearCustomizations();
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

	renderToolBarButtons() {
		if ( this.props.customizations ) {
			return (
				<div>
					<Button compact onClick={ this.undoCustomization } >{ this.translate( 'Undo last change' ) }</Button>
				</div>
			);
		}
	},

	render() {
		return (
			<WebPreview
				className={ this.props.className }
				showExternal={ false }
				showClose={ false }
				showPreview={ this.props.showPreview }
				previewMarkup={ this.props.previewMarkup }
				onClose={ this.onClosePreview }
				onLoad={ this.onLoad }
			>
			{ this.renderToolBarButtons() }
			</WebPreview>
		);
	}
} );

function mapStateToProps( state ) {
	if ( ! state.preview ) {
		return {};
	}
	const selectedSiteId = state.ui.selectedSiteId;
	const { previewMarkup, customizations, isSaved } = state.preview;
	return {
		selectedSiteId,
		previewMarkup,
		customizations,
		isCustomizationsSaved: isSaved,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( PreviewActions, dispatch ),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignPreview );
