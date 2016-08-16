/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import layoutFocus from 'lib/layout-focus';
import { showPreviewSidebar, hidePreviewSidebar } from 'state/ui/actions';

const NativeCustomizer = React.createClass( {
	propTypes: {
		showPreviewSidebar: React.PropTypes.func.isRequired,
		hidePreviewSidebar: React.PropTypes.func.isRequired,
	},

	componentWillMount() {
		this.props.showPreviewSidebar();
		layoutFocus.set( 'preview' );
	},

	componentWillUnmount() {
		this.props.hidePreviewSidebar();
		layoutFocus.set( 'content' );
	},

	render() {
		return (
			<div className="paladin__native-customizer">
			</div>
		);
	}
} );

export default connect( () => ( {} ), { showPreviewSidebar, hidePreviewSidebar } )( NativeCustomizer );
