/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import Button from '..';
import Card from '../../card';
import DocsExample from 'calypso/devdocs/docs-example';

export default class ButtonExample extends React.PureComponent {
	static displayName = 'ButtonExample';

	static defaultProps = {
		exampleCode: (
			<Card>
				<div className="docs__design-button-row">
					<Button>Button</Button>
					<Button>
						<Gridicon icon="heart" />
						<span>Icon button</span>
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
						<span>Scary icon button</span>
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
						<span>Primary icon button</span>
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
						<span>Primary scary icon button</span>
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
						<span>Remove</span>
					</Button>
					<Button borderless>
						<Gridicon icon="trash" />
						<span>Trash</span>
					</Button>
					<Button borderless>
						<Gridicon icon="link-break" />
						<span>Disconnect</span>
					</Button>
					<Button borderless>
						<Gridicon icon="trash" />
					</Button>
					<Button borderless disabled>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button borderless primary>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
					<Button borderless primary>
						<Gridicon icon="trash" />
						<span>Trash</span>
					</Button>
					<Button borderless primary>
						<Gridicon icon="link-break" />
						<span>Disconnect</span>
					</Button>
					<Button borderless primary>
						<Gridicon icon="trash" />
					</Button>
					<Button borderless primary disabled>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button borderless scary>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
					<Button borderless scary>
						<Gridicon icon="trash" />
						<span>Trash</span>
					</Button>
					<Button borderless scary>
						<Gridicon icon="link-break" />
						<span>Disconnect</span>
					</Button>
					<Button borderless scary>
						<Gridicon icon="trash" />
					</Button>
					<Button borderless scary disabled>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button compact>
						<Gridicon icon="cross" />
						<span>Remove</span>
					</Button>
					<Button compact>
						<Gridicon icon="trash" />
						<span>Trash</span>
					</Button>
					<Button compact>
						<Gridicon icon="link-break" />
						<span>Disconnect</span>
					</Button>
					<Button compact>
						<Gridicon icon="trash" />
					</Button>
					<Button compact disabled>
						<Gridicon icon="cross" />
						<span>Remove</span>
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
						<span>Primary scary busy button</span>
					</Button>
				</div>

				<div className="docs__design-button-row">
					<Button plain>Plain button</Button>
				</div>
			</Card>
		),
	};

	render() {
		return <DocsExample>{ this.props.exampleCode }</DocsExample>;
	}
}
