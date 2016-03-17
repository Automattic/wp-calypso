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
import * as DesignMenuActions from 'my-sites/design-menu/actions';
import accept from 'lib/accept';
import { updatePreviewWithChanges } from 'lib/web-preview';

const debug = debugFactory( 'calypso:design-preview' );

const DesignPreview = React.createClass( {

	propTypes: {
		className: React.PropTypes.string,
		showPreview: React.PropTypes.bool,
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object,
		designMenuActions: React.PropTypes.object,
		isCustomizationsSaved: React.PropTypes.bool,
		onLoad: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			customizations: {},
			designMenuActions: {},
			isCustomizationsSaved: true,
			onLoad: noop,
		};
	},

	componentDidUpdate( prevProps ) {
		// If the customizations have been removed, restore the original markup
		if ( this.props.previewMarkup && this.props.customizations && this.props.previewMarkup === prevProps.previewMarkup && prevProps.customizations ) {
			if ( Object.keys( this.props.customizations ).length === 0 && Object.keys( prevProps.customizations ).length > 0 ) {
				debug( 'restoring original markup' );
				// TODO: somehow force the initial markup to be restored because the DOM
				// may have been changed, and simply not applying customizations will
				// not restore it.
			}
		}
		// Apply customizations
		if ( this.props.customizations && this.previewDocument ) {
			debug( 'updating preview with customizations', this.props.customizations );
			updatePreviewWithChanges( this.previewDocument, this.props.customizations );
		}
	},

	undoCustomization() {
		if ( this.props.designMenuActions.undoCustomization ) {
			this.props.designMenuActions.undoCustomization();
		}
	},

	saveCustomizations() {
		if ( this.props.designMenuActions.saveCustomizations ) {
			this.props.designMenuActions.saveCustomizations();
		}
	},

	onLoad( previewDocument ) {
		this.previewDocument = previewDocument;
		this.props.onLoad( previewDocument );
	},

	onClosePreview() {
		if ( this.props.customizations && ! this.props.isCustomizationsSaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.designMenuActions.closeDesignMenu();
				}
			} );
		}
		this.props.designMenuActions.closeDesignMenu();
	},

	onPreviewClick( event ) {
		if ( ! event.target.href ) {
			return;
		}
		event.preventDefault();
		// TODO: if the href is on the current site, load the href as a preview and fetch markup for that url
	},

	renderToolBarButtons() {
		if ( this.props.customizations && this.props.designMenuActions.saveCustomizations ) {
			const saveButtonText = this.props.isCustomizationsSaved ? this.translate( 'Saved' ) : this.translate( 'Save & Publish' );
			return (
				<div>
					<Button compact onClick={ this.undoCustomization } >{ this.translate( 'Undo last change' ) }</Button>
					<Button compact primary disabled={ this.props.isCustomizationsSaved } onClick={ this.saveCustomizations } >{ saveButtonText }</Button>
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
				onClick={ this.onPreviewClick }
				onLoad={ this.onLoad }
			>
			{ this.renderToolBarButtons() }
			</WebPreview>
		);
	}
} );

function mapStateToProps( state ) {
	const { previewMarkup, customizations, isSaved } = state.tailor;
	return {
		previewMarkup,
		customizations,
		isCustomizationsSaved: isSaved,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		designMenuActions: bindActionCreators( DesignMenuActions, dispatch ),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignPreview );
