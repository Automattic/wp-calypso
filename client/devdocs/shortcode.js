/** @format */

/**
 * Internal dependencies
 */

import AsyncLoad from 'components/async-load';

/**
 * External dependencies
 */

import React from 'react';

export default class extends React.Component {
	static displayName = 'Shortcode';

	createRequireFunction( name, variant ) {
		return callback => {
			import( 'devdocs/muriel/component-examples/' + name ).then( module => {
				callback( module[ variant ] );
			} );
		};
	}

	render() {
		const { name, variant, ...childProps } = this.props.attributes;

		return <AsyncLoad require={ this.createRequireFunction( name, variant ) } { ...childProps } />;
	}
}
