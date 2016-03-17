/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import * as DesignMenuActions from 'my-sites/design-menu/actions';
import accept from 'lib/accept';

const DesignPreview = React.createClass( {

	propTypes: {
		className: React.PropTypes.string,
		showPreview: React.PropTypes.bool,
		previewMarkup: React.PropTypes.string,
		customizations: React.PropTypes.object,
		designMenuActions: React.PropTypes.object,
		isCustomizationsSaved: React.PropTypes.bool,
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

	render() {
		return (
			<WebPreview
				className={ this.props.className }
				showExternal={ false }
				showClose={ false }
				showPreview={ this.props.showPreview }
				previewMarkup={ this.props.previewMarkup }
				customizations={ this.props.customizations }
				actions={ this.props.designMenuActions }
				isCustomizationsSaved={ this.props.isCustomizationsSaved }
				onClose={ this.onClosePreview }
				onClick={ this.onPreviewClick }
			/>
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
