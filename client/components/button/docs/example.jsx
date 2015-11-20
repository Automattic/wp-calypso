/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	Card = require( 'components/card' );

var Buttons = React.createClass( {
	displayName: 'Buttons',

	mixins: [ React.addons.PureRenderMixin ],

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
					<a href="/devdocs/design/buttons">Button</a>
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
						<Button>Button</Button>
						<Button icon><Gridicon icon="heart" /> Icon button</Button>
						<Button icon><Gridicon icon="plugins" /></Button>
						<Button disabled >Disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button scary >Scary button</Button>
						<Button scary icon><Gridicon icon="globe" /> Scary icon button</Button>
						<Button scary icon><Gridicon icon="pencil" /></Button>
						<Button scary disabled >Scary disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button primary >Primary button</Button>
						<Button primary icon ><Gridicon icon="camera" /> Primary icon button</Button>
						<Button primary icon ><Gridicon icon="time" /></Button>
						<Button primary disabled >Primary disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button primary scary >Primary scary button</Button>
						<Button primary scary icon ><Gridicon icon="user-circle" /> Primary scary icon button</Button>
						<Button primary scary icon ><Gridicon icon="cart" /></Button>
						<Button primary scary disabled >Primary scary disabled button</Button>
					</div>
				</Card>
			);
		} else {
			return (
				<Card>
					<div className="design-assets__button-row">
						<Button compact >Compact button</Button>
						<Button compact icon><Gridicon icon="heart" /> Compact icon button</Button>
						<Button compact icon><Gridicon icon="plugins" /></Button>
						<Button compact disabled >Compact disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button compact scary >Compact scary button</Button>
						<Button compact scary icon><Gridicon icon="globe" /> Compact scary icon button</Button>
						<Button compact scary icon><Gridicon icon="pencil" /></Button>
						<Button compact scary disabled >Compact scary disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button compact primary >Compact primary button</Button>
						<Button compact primary icon ><Gridicon icon="camera" /> Compact primary icon button</Button>
						<Button compact primary icon ><Gridicon icon="time" /></Button>
						<Button compact primary disabled >Compact primary disabled button</Button>
					</div>
					<div className="design-assets__button-row">
						<Button compact primary scary >Compact primary scary button</Button>
						<Button compact primary scary icon ><Gridicon icon="user-circle" /> Compact primary scary icon button</Button>
						<Button compact primary scary icon ><Gridicon icon="cart" /></Button>
						<Button compact primary scary disabled >Compact primary scary disabled button</Button>
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
