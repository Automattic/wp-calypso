/** @format */

/**
 * External dependencies
 */

import React from 'react';
import GridiconLinkBreak from 'gridicons/dist/link-break';
import GridiconTrash from 'gridicons/dist/trash';
import GridiconCross from 'gridicons/dist/cross';
import GridiconCart from 'gridicons/dist/cart';
import GridiconUserCircle from 'gridicons/dist/user-circle';
import GridiconTime from 'gridicons/dist/time';
import GridiconCamera from 'gridicons/dist/camera';
import GridiconPencil from 'gridicons/dist/pencil';
import GridiconGlobe from 'gridicons/dist/globe';
import GridiconPlugins from 'gridicons/dist/plugins';
import GridiconHeart from 'gridicons/dist/heart';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import DocsExample from 'devdocs/docs-example';

Button.displayName = 'Button';

class Buttons extends React.PureComponent {
	static displayName = 'Button';

	static defaultProps = {
		exampleCode: (
			<Card>
				<div className="docs__design-button-row">
					<Button>Button</Button>
					<Button>
						<GridiconHeart />
						<span>Icon button</span>
					</Button>
					<Button>
						<GridiconPlugins />
					</Button>
					<Button disabled>Disabled button</Button>
				</div>
				<div className="docs__design-button-row">
					<Button scary>Scary button</Button>
					<Button scary>
						<GridiconGlobe />
						<span>Scary icon button</span>
					</Button>
					<Button scary>
						<GridiconPencil />
					</Button>
					<Button scary disabled>
						Scary disabled button
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button primary>Primary button</Button>
					<Button primary>
						<GridiconCamera />
						<span>Primary icon button</span>
					</Button>
					<Button primary>
						<GridiconTime />
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
						<GridiconUserCircle />
						<span>Primary scary icon button</span>
					</Button>
					<Button primary scary>
						<GridiconCart />
					</Button>
					<Button primary scary disabled>
						Primary scary disabled button
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button borderless>
						<GridiconCross />
						<span>Remove</span>
					</Button>
					<Button borderless>
						<GridiconTrash />
						<span>Trash</span>
					</Button>
					<Button borderless>
						<GridiconLinkBreak />
						<span>Disconnect</span>
					</Button>
					<Button borderless>
						<GridiconTrash />
					</Button>
					<Button borderless disabled>
						<GridiconCross />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button borderless primary>
						<GridiconCross />
						<span>Remove</span>
					</Button>
					<Button borderless primary>
						<GridiconTrash />
						<span>Trash</span>
					</Button>
					<Button borderless primary>
						<GridiconLinkBreak />
						<span>Disconnect</span>
					</Button>
					<Button borderless primary>
						<GridiconTrash />
					</Button>
					<Button borderless primary disabled>
						<GridiconCross />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button borderless scary>
						<GridiconCross />
						<span>Remove</span>
					</Button>
					<Button borderless scary>
						<GridiconTrash />
						<span>Trash</span>
					</Button>
					<Button borderless scary>
						<GridiconLinkBreak />
						<span>Disconnect</span>
					</Button>
					<Button borderless scary>
						<GridiconTrash />
					</Button>
					<Button borderless scary disabled>
						<GridiconCross />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button compact>
						<GridiconCross />
						<span>Remove</span>
					</Button>
					<Button compact>
						<GridiconTrash />
						<span>Trash</span>
					</Button>
					<Button compact>
						<GridiconLinkBreak />
						<span>Disconnect</span>
					</Button>
					<Button compact>
						<GridiconTrash />
					</Button>
					<Button compact disabled>
						<GridiconCross />
						<span>Remove</span>
					</Button>
				</div>
				<div className="docs__design-button-row">
					<Button busy>Busy button</Button>
					<Button primary busy>
						<GridiconTime />
					</Button>
					<Button primary busy>
						Primary busy button
					</Button>
					<Button primary scary busy>
						<GridiconTrash />
						<span>Primary scary busy button</span>
					</Button>
				</div>
			</Card>
		),
	};

	render() {
		return config.isEnabled( 'devdocs/components-usage-stats' )
			? this.renderDocsExampleWithUsageStats()
			: this.renderDocsExample();
	}

	renderDocsExample = () => {
		return <DocsExample>{ this.renderButtons() }</DocsExample>;
	};

	renderDocsExampleWithUsageStats = () => {
		return (
			<DocsExample componentUsageStats={ this.props.componentUsageStats }>
				{ this.renderButtons() }
			</DocsExample>
		);
	};

	renderButtons = () => {
		return this.props.exampleCode;
	};
}

export default Buttons;
