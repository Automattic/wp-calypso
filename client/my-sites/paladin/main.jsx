/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const NativeCustomizer = React.createClass( {
	propTypes: {
	},

	componentWillMount() {
		this.props.setLayoutFocus( 'preview' );
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

export default connect( null, { setLayoutFocus } )( NativeCustomizer );
