/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Count = require( 'components/count' );

module.exports = React.createClass( {
	displayName: 'Count',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/count">Count</a>
				</h2>
				<div>
					<Count count={ 65365 } />
				</div>
			</div>
		);
	}
} );
