/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

const DocsExampleToggle = ( { onClick, text } ) => <Button onClick={ onClick }>{ text }</Button>;

DocsExampleToggle.propTypes = {
	onClick: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired,
};

const DocsExample = ( { children, toggleHandler, toggleText } ) => {
	return (
		<section className="docs-example">
			<header className="docs-example__header">
				{ toggleHandler && toggleText && (
					<span className="docs-example__toggle">
						<DocsExampleToggle onClick={ toggleHandler } text={ toggleText } />
					</span>
				) }
			</header>
			<div className="docs-example__main">{ children }</div>
		</section>
	);
};

DocsExample.propTypes = {
	toggleHandler: PropTypes.func,
	toggleText: PropTypes.string,
};

export { DocsExampleToggle };

export default DocsExample;
