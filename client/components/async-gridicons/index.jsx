/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FallbackIcon from './fallback';

const loadedIcons = new Map();

function loadIcon( icon ) {
	return import( /* webpackChunkName: "gridicons", webpackInclude: /\.js$/, webpackMode: "lazy-once" */
	`gridicons/dist/${ icon }` ).then(
		g => {
			loadedIcons.set( icon, g.default );
			return g.default;
		},
		err => {
			loadedIcons.set( icon, false );
			console.warn( `Error loading icon '${ icon }':`, err.message ); // eslint-disable-line no-console
		}
	);
}

class AsyncGridicon extends Component {
	constructor( props ) {
		super( props );
	}
	checkAndLoad() {
		if ( ! loadedIcons.has( this.props.icon ) ) {
			loadIcon( this.props.icon ).then( () => this.update() );
		}
	}

	componentDidMount() {
		this.checkAndLoad();
	}
	componentDidUpdate() {
		this.checkAndLoad();
	}

	update = () => this.forceUpdate();

	componentWillUnmount() {
		this.update = () => {};
	}

	render() {
		const { icon = '', ...rest } = this.props;
		if ( loadedIcons.get( icon ) ) {
			const Icon = loadedIcons.get( icon );
			return <Icon { ...rest } />;
		}

		return <FallbackIcon { ...rest } />;
	}
}

export default AsyncGridicon;
