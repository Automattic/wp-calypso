/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var RemoveButton = require( 'components/remove-button' ),
	Card = require( 'components/card' );

var RemoveButtons = React.createClass( {
	displayName: 'RemoveButtons',

	getInitialState: function() {
		return {
			compactButtons: false
		};
	},

	render: function() {
		var toggleButtonsText = this.state.compactButtons ? 'Normal Buttons' : 'Compact Buttons';

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/removebuttons">RemoveButton</a>
					<a className="design-assets__toggle button" onClick={ this.toggleButtons }>{ toggleButtonsText }</a>
				</h2>
				{ this.renderButtons() }
			</div>
		);
	},

	renderButtons: function() {
		return (
			<Card>
				<div className="design-assets__button-row">
					<RemoveButton compact={ this.state.compactButtons }>
						{ this.state.compactButtons ? 'Remove Compact' : 'Remove' }
					</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="trash">Trash</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="delete">Delete</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="disconnect">Disconnect</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="deactivate">Deactivate</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } disabled >Remove Disabled</RemoveButton>
				</div>
				<div className="design-assets__button-row">
					<RemoveButton compact={ this.state.compactButtons }></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } disabled ></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="trash"></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } icon="disconnect"></RemoveButton>
				</div>
				<div className="design-assets__button-row">
					<RemoveButton compact={ this.state.compactButtons } scary>Remove</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="trash">Trash</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="delete">Delete</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="disconnect">Disconnect</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="deactivate">Deactivate</RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary disabled >Remove Disabled</RemoveButton>
				</div>
				<div className="design-assets__button-row">
					<RemoveButton compact={ this.state.compactButtons } scary></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary disabled ></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="trash"></RemoveButton>
					<RemoveButton compact={ this.state.compactButtons } scary icon="disconnect"></RemoveButton>
				</div>
			</Card>
		);
	},

	toggleButtons: function() {
		this.setState( { compactButtons: ! this.state.compactButtons } );
	}
} );

module.exports = RemoveButtons;
