/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import BlockButton from 'components/button/block';
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

				<h3>Block-level Button Wrapper</h3>
				<Card>
					<div className="docs__design-button-row">
						<BlockButton onClick={ noop }>
							<p>
								This "button" can contain other elements as children, including <code>p</code>s,{' '}
								<code>div</code>s, or other components.
							</p>
							<p>
								The container itself is focusable - try tabbing from the previous button example
								into here.
							</p>
						</BlockButton>
					</div>
				</Card>
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
							<Gridicon icon="heart" /> Icon button
						</Button>
						<Button>
							<Gridicon icon="plugins" />
						</Button>
						<Button disabled>Disabled button</Button>
					</div>
					<div className="docs__design-button-row">
						<Button scary>Scary button</Button>
						<Button scary>
							<Gridicon icon="globe" /> Scary icon button
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
							<Gridicon icon="camera" /> Primary icon button
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
							<Gridicon icon="user-circle" /> Primary scary icon button
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
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button borderless>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button borderless>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless disabled>
							<Gridicon icon="cross" /> Remove
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button borderless primary>
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button borderless primary>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button borderless primary>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button borderless primary>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless primary disabled>
							<Gridicon icon="cross" /> Remove
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button borderless scary>
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button borderless scary>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button borderless scary>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button borderless scary>
							<Gridicon icon="trash" />
						</Button>
						<Button borderless scary disabled>
							<Gridicon icon="cross" /> Remove
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
							<Gridicon icon="trash" /> Primary scary busy button
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
							<Gridicon icon="heart" /> Compact icon button
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
							<Gridicon icon="globe" /> Compact scary icon button
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
							<Gridicon icon="camera" /> Compact primary icon button
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
							<Gridicon icon="user-circle" /> Compact primary scary icon button
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
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button compact borderless>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button compact borderless>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button compact borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button compact borderless disabled>
							<Gridicon icon="cross" /> Remove
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact primary borderless>
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button compact primary borderless>
							<Gridicon icon="trash" />
						</Button>
						<Button compact primary borderless disabled>
							<Gridicon icon="cross" /> Remove
						</Button>
					</div>
					<div className="docs__design-button-row">
						<Button compact borderless scary>
							<Gridicon icon="cross" /> Remove
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="trash" /> Trash
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="link-break" /> Disconnect
						</Button>
						<Button compact borderless scary>
							<Gridicon icon="trash" />
						</Button>
						<Button compact borderless scary disabled>
							<Gridicon icon="cross" /> Remove
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
							<Gridicon icon="trash" /> Compact primary scary busy button
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
