/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'components/count';

export default class CountExample extends React.Component {
	static displayName = 'Count';
	render() {
		return <Count count={ 65365 } />;
	}
}
