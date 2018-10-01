/** @format */
/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

export default class AsyncChart extends React.Component {
	render() {
		return <AsyncLoad { ...this.props } require="./chart" />;
	}
}
