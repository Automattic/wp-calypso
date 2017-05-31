/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SearchStreamHeader from '../../search-stream-header';

export default class SearchStreamHeaderExample extends PureComponent {
	static displayName = 'SearchStreamHeaderExample';
	render() {
		return <Card><SearchStreamHeader /></Card>;
	}
}
