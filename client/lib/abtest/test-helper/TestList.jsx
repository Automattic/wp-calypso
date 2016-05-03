import React from 'react';
import Test from './Test';

export default React.createClass( {
	displayName: 'TestList',

	render: function() {
		return (
			<div>
				{ this.props.tests.map( test => <Test
					key={ test.name }
					test={ test }
					onChangeVariant={ this.props.onChangeVariant }
				/> ) }
			</div>
		);
	}
} );
