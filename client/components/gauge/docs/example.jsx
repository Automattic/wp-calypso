/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import Gauge from 'components/gauge';

module.exports = React.createClass( {
	displayName: 'Gauge',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Gauge"
				url="/devdocs/design/gauge"
				componentUsageStats={ this.props.getUsageStats( Gauge ) }
			>
				<Gauge percentage={ 27 } metric={ 'test' } />
			</DocsExample>
		);
	}
} );
