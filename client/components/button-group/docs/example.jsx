/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var ButtonGroup = require( 'components/button-group' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

var Buttons = React.createClass( {
	displayName: 'ButtonGroup',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			compact: false
		};
	},

	toggleButtons: function() {
		this.setState( { compact: ! this.state.compact } );
	},

	render: function() {
		return (
			<div>
				<a className="design-assets__toggle button" onClick={ this.toggleButtons }>
					{ this.state.compact ? 'Normal Buttons' : 'Compact Buttons' }
				</a>
				<Card>
					<div>
						<ButtonGroup className="example">
							<Button compact={ this.state.compact }>Do thing</Button>
							<Button compact={ this.state.compact }>Do another thing</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button compact={ this.state.compact }>Button one</Button>
							<Button compact={ this.state.compact }>Button two</Button>
							<Button compact={ this.state.compact } scary>Button Three</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button compact={ this.state.compact }><Gridicon icon="add-image" /></Button>
							<Button compact={ this.state.compact }><Gridicon icon="heart" /></Button>
							<Button compact={ this.state.compact }><Gridicon icon="briefcase" /></Button>
							<Button compact={ this.state.compact }><Gridicon icon="history" /></Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button primary compact={ this.state.compact }>Publish</Button>
							<Button primary compact={ this.state.compact }><Gridicon icon="calendar" /></Button>
						</ButtonGroup>
					</div>
				</Card>
			</div>
		);
	},
} );

module.exports = Buttons;
