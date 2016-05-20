/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var FollowButton = require( 'components/follow-button/button' ),
	Card = require( 'components/card/compact' ),
	DocsExample = require( 'components/docs-example' );

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
