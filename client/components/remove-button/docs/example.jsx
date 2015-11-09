/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var RemoveButton = require( 'components/remove-button' ),
	Card = require( 'components/card' );

var Buttons = React.createClass( {
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
					<a href="/devdocs/design/buttons">RemoveButton</a>
					<a className="design-assets__toggle button" onClick={ this.toggleButtons }>{ toggleButtonsText }</a>
				</h2>
				{ this.renderButtons() }
			</div>
		);
	},

	renderButtons: function() {
		if ( ! this.state.compactButtons ) {
			return (
				<Card>
					<div className="design-assets__button-row">
						<RemoveButton>Remove</RemoveButton>
						<RemoveButton icon="trash">Trash</RemoveButton>
						<RemoveButton icon="delete">Delete</RemoveButton>
            <RemoveButton icon="disconnect">Disconnect</RemoveButton>
            <RemoveButton icon="deactivate">Deactivate</RemoveButton>
						<RemoveButton disabled >Remove Disabled</RemoveButton>
					</div>
					<div className="design-assets__button-row">
						<RemoveButton></RemoveButton>
						<RemoveButton disabled ></RemoveButton>		
						<RemoveButton icon="trash"></RemoveButton>
						<RemoveButton icon="disconnect"></RemoveButton>

					</div>
          <div className="design-assets__button-row">
						<RemoveButton scary>Remove</RemoveButton>
						<RemoveButton scary icon="trash">Trash</RemoveButton>
						<RemoveButton scary icon="delete">Delete</RemoveButton>
            <RemoveButton scary icon="disconnect">Disconnect</RemoveButton>
            <RemoveButton scary icon="deactivate">Deactivate</RemoveButton>
						<RemoveButton scary disabled >Remove Disabled</RemoveButton>
					</div>
					<div className="design-assets__button-row">
						<RemoveButton scary></RemoveButton>
						<RemoveButton scary disabled ></RemoveButton>
						<RemoveButton scary icon="trash"></RemoveButton>
            <RemoveButton scary icon="disconnect"></RemoveButton>
					</div>
				</Card>
			);
		} else {
			return (
				<Card>
          <div className="design-assets__button-row">
            <RemoveButton compact>Remove Compact</RemoveButton>
            <RemoveButton compact icon="trash">Trash</RemoveButton>
            <RemoveButton compact icon="delete">Delete</RemoveButton>
            <RemoveButton compact icon="disconnect">Disconnect</RemoveButton>
            <RemoveButton compact icon="deactivate">Deactivate</RemoveButton>
            <RemoveButton compact disabled >Remove Disabled</RemoveButton>
          </div>
          <div className="design-assets__button-row">
						<RemoveButton compact scary>Remove Scary Compact</RemoveButton>
						<RemoveButton compact scary icon="trash">Trash</RemoveButton>
						<RemoveButton compact scary icon="delete">Delete</RemoveButton>
            <RemoveButton compact scary icon="disconnect">Disconnect</RemoveButton>
            <RemoveButton compact scary icon="deactivate">Deactivate</RemoveButton>
						<RemoveButton compact scary disabled >Remove Disabled</RemoveButton>
					</div>
					<div className="design-assets__button-row">
						<RemoveButton compact scary></RemoveButton>
						<RemoveButton compact scary icon="trash"></RemoveButton>
						<RemoveButton compact scary icon="delete"></RemoveButton>
						<RemoveButton compact scary icon="disconnect"></RemoveButton>
						<RemoveButton compact scary icon="deactivate"></RemoveButton>
						<RemoveButton compact scary disabled ></RemoveButton>
					</div>
				</Card>
			);
		}
	},

	toggleButtons: function() {
		this.setState( { compactButtons: ! this.state.compactButtons } );
	}
} );

module.exports = Buttons;
