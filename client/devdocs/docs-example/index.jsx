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
	<Button onClick={ onClick }>
		{ text }
	</Button>
);

DocsExampleToggle.propTypes = {
	onClick: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired
};

const DocsExampleStats = ( { count } ) =>
	<div className="docs-example__stats">
		<p className="docs-example__stats__item">
			Used in <Count count={ count } /> components.
		</p>
	</div>;

DocsExampleStats.propTypes = {
	count: PropTypes.number.isRequired
};

const DocsExample = ( {
	children,
	componentUsageStats = {},
	toggleHandler,
	toggleText,
} ) => {
	const { count } = componentUsageStats;

	return (
		<section className="docs-example">
			<header className="docs-example__header">
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

			<footer role="contentinfo" className="docs-example__footer">
				{
					! isNaN( count ) && (
						<div className="docs-example__stats">
							<DocsExampleStats count={ count } />
						</div>
					)
				}
			</footer>
		</section>
	);
};

DocsExample.propTypes = {
	children: React.PropTypes.element.isRequired,
	componentUsageStats: PropTypes.shape( {
		count: PropTypes.number
	} ),
	toggleHandler: PropTypes.func,
	toggleText: PropTypes.string,
};

export {
	DocsExampleToggle,
	DocsExampleStats
};

export default DocsExample;
