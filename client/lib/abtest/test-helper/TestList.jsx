import React from 'react';
import Test from './Test';

import Card from 'components/card';

export default React.createClass( {
	displayName: 'TestList',

	render: function() {
		return (
			<div>
				<a href={ "/devdocs/client/lib/abtest/README.md" } title="ABTests">ABTests</a>
				<Card className="active-tests">
					{ this.props.tests.map( test => <Test
						key={ test.name }
						test={ test }
						onChangeVariant={ this.props.onChangeVariant }
					/> ) }
				</Card>
			</div>
		);
	}
} );
