/**
 * External Dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import LoadingProps from './loadingProps';

/**
 * This component displays when the variation is unknown and an API call needs to be made
 */
export default class LoadingVariations extends Component< LoadingProps, {} > {
	render() {
		const { variation, isLoading: loading, children } = this.props;
		if ( variation == null && loading ) return <>{ children }</>;
		return null;
	}
}
