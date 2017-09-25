/**
 * External dependencies
 */
import React from 'react';

import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Gauge from 'components/gauge';

module.exports = React.createClass( {
	displayName: 'Gauge',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<Gauge percentage={ 27 } metric={ 'test' } />
		);
	}
} );
