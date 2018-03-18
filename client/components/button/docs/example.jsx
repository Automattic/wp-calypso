/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import DocsExample from 'devdocs/docs-example';

class Buttons extends React.PureComponent {
	static displayName = 'Buttons';

	state = {
		compactButtons: false,
	};

	render() {
		var toggleText = this.state.compactButtons ? 'Normal Buttons' : 'Compact Buttons';
		return config.isEnabled( 'devdocs/components-usage-stats' )
			? this.renderDocsExampleWithUsageStats( toggleText )
			: this.renderDocsExample( toggleText );
	}

	renderDocsExample = toggleText => {
		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleButtons }>
					{ toggleText }
				</a>
				{ this.renderButtons( toggleText ) }
			</div>
		);
	};

	renderDocsExampleWithUsageStats = toggleText => {
		return (
			<DocsExample
				componentUsageStats={ this.props.componentUsageStats }
				toggleHandler={ this.toggleButtons }
				toggleText={ toggleText }
			>
				{ this.renderButtons() }
			</DocsExample>
		);
	};

	renderButtons = () => {
		if ( ! this.state.compactButtons ) {
			return (
				<Card>
					<div className="docs__design-button-row">
						<Button>Button</Button>
						<Button>
							<Gridicon icon="heart" />
							<span className="button-text">Icon button</span>
						</Button>
						<Button>
							<Gridicon icon="plugins" />
						</Button>
						<Button disabled>Disabled button</Button>
					</div>
					<div className="docs__design-button-row">
						<Button scary>Scary button</Button>
						<Button scary>
							<Gridicon icon="globe" />
							<span className="button-text">Scary icon button</span>
						</Button>
						<Button scary>
							<Gridicon icon="pencil" />
						</Button>
						<Button scary disabled>
							Scary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button primary>Primary button</Button>
						<Button primary>
							<Gridicon icon="camera" />
							<span className="button-text">Primary icon button</span>
						</Button>
						<Button primary>
							<Gridicon icon="time" />
						</Button>
						<Button primary disabled>
							Primary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button primary scary>
							Primary scary button
						</Button>
						<Button primary scary>
							<Gridicon icon="user-circle" />
							<span className="button-text">Primary scary icon button</span>
						</Button>
						<Button primary scary>
							<Gridicon icon="cart" />
						</Button>
						<Button primary scary disabled>
							Primary scary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button borderless>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button borderless>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button borderless>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button borderless primary>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button borderless primary>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button borderless primary>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button borderless primary>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless primary disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button borderless scary>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button borderless scary>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button borderless scary>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button borderless scary>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless scary disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button busy>Busy button</Button>
						<Button primary busy>
							<Gridicon icon="time" />
						</Button>
						<Button primary busy>
							Primary busy button
						</Button>
						<Button primary scary busy>
							<Gridicon icon="trash" />
							<span className="button-text">Primary scary busy button</span>
						</Button>
					</div>
				</Card>
			);
		} else {
			return (
				<Card>
					<div className="docs__design-button-row">
						<Button compact>Compact button</Button>
						<Button compact>
							<Gridicon icon="heart" />
							<span className="button-text">Compact icon button</span>
						</Button>
						<Button compact>
							<Gridicon icon="plugins" />
						</Button>
						<Button compact disabled>
							Compact disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact scary>
							Compact scary button
						</Button>
						<Button compact scary>
							<Gridicon icon="globe" />
							<span className="button-text">Compact scary icon button</span>
						</Button>
						<Button compact scary>
							<Gridicon icon="pencil" />
						</Button>
						<Button compact scary disabled>
							Compact scary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact primary>
							Compact primary button
						</Button>
						<Button compact primary>
							<Gridicon icon="camera" />
							<span className="button-text">Compact primary icon button</span>
						</Button>
						<Button compact primary>
							<Gridicon icon="time" />
						</Button>
						<Button compact primary disabled>
							Compact primary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact primary scary>
							Compact primary scary button
						</Button>
						<Button compact primary scary>
							<Gridicon icon="user-circle" />
							<span className="button-text">Compact primary scary icon button</span>
						</Button>
						<Button compact primary scary>
							<Gridicon icon="cart" />
						</Button>
						<Button compact primary scary disabled>
							Compact primary scary disabled button
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact borderless>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button compact borderless>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button compact borderless>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button compact borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button compact borderless disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact primary borderless>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button compact primary borderless disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact borderless scary>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="trash" />
							<span className="button-text">Trash</span>
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="link-break" />
							<span className="button-text">Disconnect</span>
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="trash" />
						</Button>
						<Button compact borderless scary disabled>
							<Gridicon icon="cross" />
							<span className="button-text">Remove</span>
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact busy>
							Busy button
						</Button>
						<Button compact primary busy>
							<Gridicon icon="time" />
						</Button>
						<Button compact primary busy>
							Primary busy button
						</Button>
						<Button compact primary scary busy>
							<Gridicon icon="trash" />
							<span className="button-text">Compact primary scary busy button</span>
						</Button>
					</div>
				</Card>
			);
		}
	};

	toggleButtons = () => {
		this.setState( { compactButtons: ! this.state.compactButtons } );
	};
}

export default Buttons;
