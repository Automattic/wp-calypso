/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import closeOnEsc from 'lib/mixins/close-on-esc';

const TipWrapper = React.createClass( {
	mixins: [ closeOnEsc( 'close' ) ],

	render() {
		return (
			<div className= "popover__tip-wrapper" { ...this.props } tabIndex="-1" />
		);
	},

	close() {
		this.props.onClose();
	}
} );

export default TipWrapper;
