/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import Card from 'components/card';
import DocsExample from 'componets/docs-example';
import Gridicon from 'components/gridicon';

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
			<DocsExample
				title="Button Group"
				url="/devdocs/design/button-group"
				componentUsageStats={ this.props.componentUsageStats }
				toggleHandler={ this.toggleButtons }
				toggleText={ this.state.compact ? 'Normal Buttons' : 'Compact Buttons' }
			>
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
			</DocsExample>
		);
	},
} );

module.exports = Buttons;
