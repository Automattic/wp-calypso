/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DailyPostButton from 'blocks/daily-post-button';
import { dailyPromptPost } from 'blocks/daily-post-button/test/fixtures';

const DailyPostButtonExample = () => {
	return (
		<div className="design-assets__group">
			<DailyPostButton post={ dailyPromptPost } />
		</div>
	);
};

DailyPostButtonExample.displayName = 'DailyPostButton';

export default DailyPostButtonExample;