/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FollowButton from 'components/follow-button/button';
import Card from 'components/card/compact';
import DocsExample from 'components/docs-example';

var FollowButtons = React.createClass( {
	displayName: 'FollowButtons',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Follow Button"
				url="/devdocs/design/follow-buttons"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<Card compact>
					<FollowButton following={ false } />
				</Card>
				<Card compact>
					<FollowButton following={ true } />
				</Card>
			</DocsExample>
		);
	}
} );

module.exports = FollowButtons;
