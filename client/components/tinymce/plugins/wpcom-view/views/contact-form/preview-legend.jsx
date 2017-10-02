/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependecies
 */
import PreviewRequired from './preview-required';

export default React.createClass( {
	displayName: 'PreviewLegend',

	render() {
		return ( <legend>{ this.props.label }<PreviewRequired { ...this.props } /></legend> );
	}
} );
