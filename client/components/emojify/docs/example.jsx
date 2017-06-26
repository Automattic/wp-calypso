/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';

const EmojifyExample = () => {
	const textToEmojify = 'This 🙈 will be converted 🙉🙊🙂';

	return (
		<div imgClassName="design-assets__group">
			<Emojify>{ textToEmojify }</Emojify>
		</div>
	);
};

EmojifyExample.displayName = 'Emojify';

export default EmojifyExample;
