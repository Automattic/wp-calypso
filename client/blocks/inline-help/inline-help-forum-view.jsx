/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import { preventWidows } from 'lib/formatting';

const FORUM_LINK = '//en.forums.wordpress.com';

const InlineHelpForumView = ( { translate = identity } ) => (
	<div className="inline-help__forum-view">
		<h2 className="inline-help__view-heading">
			{ preventWidows( translate( 'Ask the Community for Help' ) ) }
		</h2>
		<p>
			{ preventWidows(
				translate(
					'Use this link to post a question in our {{strong}}public forums{{/strong}}, ' +
						'where thousands of WordPress.com members around the world ' +
						'can offer their expertise and advice.',
					{
						components: {
							strong: <strong />,
						},
					}
				)
			) }
		</p>
		<Button href={ FORUM_LINK } target="_blank" rel="noopener noreferrer" primary>
			{ translate( 'Go to the Support Forums' ) }
		</Button>
	</div>
);

export default localize( InlineHelpForumView );
