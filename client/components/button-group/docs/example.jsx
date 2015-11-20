/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ButtonGroup = require( 'components/button-group' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

var Buttons = React.createClass( {
	displayName: 'ButtonGroup',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/button-group">Button Group</a>
				</h2>
				<Card>
					<div>
						<ButtonGroup className="example">
							<Button compact>One button</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button compact>Do things</Button>
							<Button compact>Cancel</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button compact>Button one</Button>
							<Button compact>Button two</Button>
							<Button compact>Button three</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button compact>Draft</Button>
							<Button compact primary>Save</Button>
							<Button compact primary scary>Delete</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button>Do bigger things</Button>
							<Button>Cancel</Button>
						</ButtonGroup>
					</div>
					<div>
						<ButtonGroup className="example">
							<Button primary>Publish</Button>
							<Button primary><Gridicon icon="calendar" /></Button>
						</ButtonGroup>
					</div>
				</Card>
			</div>
		);
	},
} );

module.exports = Buttons;
