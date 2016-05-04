/**
 * External dependencies
 */

import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';

const DocsExample = ( {
	title,
	url,
	usageStats,
	toggleHandler,
	toggleText,
	children
} ) => {
	// toggle button – toggle compact/expanded
	let toggleButton = null;

	if ( toggleHandler && toggleText ) {
		toggleButton = (
			<span className="docs-example__toggle">
				<Button onClick={ toggleHandler }>
					{ toggleText }
				</Button>
			</span>
		);
	}

	// stats
	let stats = null;
	const { count } = usageStats;

	if ( count ) {
		stats = (
			<div className="docs-example__stats">
				Used in <Count count={ count } /> components.
			</div>
		);
	}

	return (
		<section className="docs-example">
			<header className="docs-example__header">
				<h2 className="docs-example__title">
					<a href={ url }>{ title }</a>
				</h2>
				{ toggleButton }
			</header>
			<div className="docs-example__main">
				{ children }
			</div>
			<footer role="contentinfo" className="docs-example__footer">
				{ stats }
			</footer>
		</section>
	);
};

DocsExample.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	usageStats: PropTypes.object.isRequired,
	toggleHandler: PropTypes.func,
	toggleText: PropTypes.string,
	children: React.PropTypes.element.isRequired
};

export default DocsExample;
