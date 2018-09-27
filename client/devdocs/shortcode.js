/** @format */

/**
 * Internal dependencies
 */

import AsyncLoad from 'components/async-load';
import PrototypeContent from './muriel/prototype-content';

/**
 * External dependencies
 */

import React from 'react';

export default class extends React.Component {
	static displayName = 'Shortcode';

	state = {
		prototypeContent: null,
	};

	createRequireFunction( name, variant ) {
		return callback => {
			import( 'devdocs/muriel/component-examples/' + name ).then( module => {
				callback( module[ variant ] );
			} );
		};
	}

	render() {
		switch ( this.props.identifier ) {
			case 'DisplayPrototypeContent':
				return this.renderDisplayPrototypeContent();
			case 'ShowComponent':
				return this.renderShowComponent();
			default:
				return this.renderUnknownShortcode();
		}
	}

	renderDisplayPrototypeContent() {
		const { url } = this.props.attributes;

		return <PrototypeContent url={ url } />;
	}

	renderShowComponent() {
		const { name, variant, ...childProps } = this.props.attributes;

		return <AsyncLoad require={ this.createRequireFunction( name, variant ) } { ...childProps } />;
	}

	renderUnknownShortcode() {
		return <div>Unknown shortcode: { this.props.identifier }</div>;
	}
}
