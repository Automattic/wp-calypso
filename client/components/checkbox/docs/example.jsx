/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Checkbox = require( 'components/checkbox' ),
	Card = require( 'components/card' ),
	FormLabel = require( 'components/forms/form-label' );

var Checkboxes = React.createClass( {

	displayName: 'Checkboxes',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			compactButtons: false
		};
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/checkboxes">Checkbox</a>
				</h2>
				{ this.renderButtons() }
			</div>
		);
	},

	renderButtons: function() {
		return (
			<Card>
				<div><Checkbox /><span>Checkbox</span></div>
				<div><Checkbox disabled /><span>disabled Checkbox</span></div>
			</Card>
		);
	}
} );

module.exports = Checkboxes;
