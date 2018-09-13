/** @format */

/**
 * External dependencies
 */

import React from 'react';

export default class extends React.Component {
	static displayName = 'Shortcode';

	render() {
		return <div>{ JSON.stringify( this.props ) }</div>;
	}
}
