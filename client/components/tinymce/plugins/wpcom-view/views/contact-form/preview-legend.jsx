/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependecies
 */
import PreviewRequired from './preview-required';

export default React.createClass( {
	render() {
		return (
			<legend>
				{ this.props.label }
				<PreviewRequired { ...this.props } />
			</legend>
		);
	},
} );
