/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import DocsExample from 'components/docs-example';
import FollowButton from 'components/follow-button/button';

var FollowButtons = React.createClass( {
	displayName: 'FollowButtons',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Follow Button"
				url="/devdocs/design/follow-buttons"
				componentUsageStats={ this.props.getUsageStats( FollowButton ) }
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
