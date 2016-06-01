/**
 * External dependencies
 */

import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Tooltip from 'components/tooltip';
import Gridicon from 'components/gridicon';

const DocsExampleToggle = ( {
	onClick,
	text
} ) => (
	<Button onClick={ onClick }>
		{ text }
	</Button>
);

DocsExampleToggle.propTypes = {
	onClick: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired
};

class DocsExampleStats extends React.Component {
	constructor() {
		super();
		this.state = { tooltip: false };
	}

	render() {
		return (
			<div
				className="docs-example-stats"
				onMouseEnter={ () => this.setState( { tooltip: true } ) }
				onMouseLeave={ () => this.setState( { tooltip: false } ) }
				aria-label={ `This component is used by ${this.props.count} other components` }
				ref="statsTooltip"
			>
				<div aria-hidden="true">
					<Tooltip
						isVisible={ this.state.tooltip }
						position="left"
						context={ this.refs && this.refs.statsTooltip }
					>
						Number of times used
					</Tooltip>
					<span className="docs-example-stats__info">
						<Gridicon icon="stats" size={ 18 } />
						<span className="docs-example-stats__count">{ this.props.count }</span>
					</span>
				</div>
			</div>
		);
	}
}

DocsExampleStats.propTypes = {
	count: PropTypes.number.isRequired
};

const DocsExample = ( {
	title,
	url,
	componentUsageStats = {},
	toggleHandler,
	toggleText,
	children
} ) => {
	const { count } = componentUsageStats;

	return (
		<section className="docs-example">
			<header className="docs-example__header">
				<h2 className="docs-example__title">
					<a className="docs-example__link" href={ url }>{ title }</a>
				</h2>
				{
					! isNaN( count ) && (
						<div className="docs-example__stats">
							<DocsExampleStats count={ count } />
						</div>
					)
				}
				{
					toggleHandler && toggleText && (
						<span className="docs-example__toggle">
							<DocsExampleToggle onClick={ toggleHandler } text={ toggleText } />
						</span>
					)
				}
			</header>
			<div className="docs-example__main">
				{ children }
			</div>
		</section>
	);
};

DocsExample.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	componentUsageStats: PropTypes.shape( {
		count: PropTypes.number
	} ),
	toggleHandler: PropTypes.func,
	toggleText: PropTypes.string,
	children: React.PropTypes.node.isRequired
};

export {
	DocsExampleToggle,
	DocsExampleStats
};
export default DocsExample;
