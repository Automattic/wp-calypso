/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { VisuallyHidden } from '@wordpress/components';

const VisuallyHiddenExample = () => (
	<>
		<div>
			<VisuallyHidden>This should not show.</VisuallyHidden>
			<div>
				This text will <VisuallyHidden as="span">but not inline </VisuallyHidden> always show.
			</div>
		</div>
		<hr />
		<div>
			Additional class names passed to VisuallyHidden extend the component class name.{ ' ' }
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<VisuallyHidden as="label" className="test-input">
				Check out my class!{ ' ' }
			</VisuallyHidden>
			Inspect the HTML to see!
		</div>
	</>
);

export default VisuallyHiddenExample;
