/**
 * External dependencies
 */

import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';

const DocsExampleToggle = ( {
	onClick,
	text
} ) => (
	<span className="docs-example__toggle">
		<Button onClick={ onClick }>
			{ text }
		</Button>
	</span>
);

DocsExampleToggle.propTypes = {
	onClick: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired
};

const DocsExampleStats = ( { count } ) => (
	<div className="docs-example__stats">
		Used in <Count count={ count } /> components.
	</div>
);

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
					toggleHandler && toggleText
						? <DocsExampleToggle onClick={ toggleHandler } text={ toggleText } />
						: null
				}
			</header>
			<div className="docs-example__main">
				{ children }
			</div>
			<footer role="contentinfo" className="docs-example__footer">
				{
					! isNaN( count )
						? <DocsExampleStats count={ count } />
						: null
				}
			</footer>
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
	children: React.PropTypes.element.isRequired
};

export {
	DocsExampleToggle,
	DocsExampleStats
};
export default DocsExample;
