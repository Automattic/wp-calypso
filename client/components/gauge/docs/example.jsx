/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Gauge from 'components/gauge';

export default class extends React.PureComponent {
	static displayName = 'Gauge';

	render() {
		return <Gauge percentage={ 27 } metric={ 'test' } />;
	}
}
