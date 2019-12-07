/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DailyPostButton from 'blocks/daily-post-button';
const DailyPostButtonExample = () => {
	return (
		<div className="design-assets__group">
			<DailyPostButton
				post={ {
					site_ID: 489937,
					tags: {
						'daily prompts': {
							slug: 'daily-prompts-2',
						},
					},
					type: 'dp_prompt',
					title: 'Crisis',
					URL: 'https://dailypost.wordpress.com/2016/07/27/crisis/',
					short_url: 'http://wp.me/p23sd-12Mf',
				} }
			/>
		</div>
	);
};

DailyPostButtonExample.displayName = 'DailyPostButton';

export default DailyPostButtonExample;
