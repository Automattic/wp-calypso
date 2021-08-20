import React from 'react';
import Emojify from 'calypso/components/emojify';

const EmojifyExample = () => {
	const textToEmojify = 'This 🙈 will be converted 🙉🙊🙂';

	return (
		<div className="design-assets__group">
			<Emojify>{ textToEmojify }</Emojify>
		</div>
	);
};

EmojifyExample.displayName = 'Emojify';

export default EmojifyExample;
