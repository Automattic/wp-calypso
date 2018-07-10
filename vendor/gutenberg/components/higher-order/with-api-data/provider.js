/**
 * External dependencies
 */
import { mapValues, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

export default class APIProvider extends Component {
	getChildContext() {
		return mapValues( {
			getAPISchema: 'schema',
			getAPIPostTypeRestBaseMapping: 'postTypeRestBaseMapping',
			getAPITaxonomyRestBaseMapping: 'taxonomyRestBaseMapping',
		}, ( key ) => () => this.props[ key ] );
	}

	render() {
		return this.props.children;
	}
}

APIProvider.childContextTypes = {
	getAPISchema: noop,
	getAPIPostTypeRestBaseMapping: noop,
	getAPITaxonomyRestBaseMapping: noop,
};
