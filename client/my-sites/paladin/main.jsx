/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { setPreviewType } from 'state/ui/preview/actions';

const NativeCustomizer = React.createClass( {
	propTypes: {
		setPreviewType: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
	},

	componentWillMount() {
		this.props.setPreviewType( 'design-preview' );
		this.props.setLayoutFocus( 'preview-sidebar' );
	},

	componentWillUnmount() {
		this.props.setLayoutFocus( 'content' );
	},

	render() {
		return (
			<div className="paladin__native-customizer">
			</div>
		);
	}
} );

export default connect( null, { setLayoutFocus, setPreviewType } )( NativeCustomizer );
