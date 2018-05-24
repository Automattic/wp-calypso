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
import analytics from 'lib/analytics';
import { getForumUrl } from 'lib/i18n-utils';

const trackForumOpen = () => analytics.tracks.recordEvent( 'calypso_inlinehelp_forums_open' );

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
		<Button
			href={ getForumUrl() }
			target="_blank"
			rel="noopener noreferrer"
			primary
			onClick={ trackForumOpen }
		>
			{ translate( 'Go to the Support Forums' ) }
		</Button>
	</div>
);

export default localize( InlineHelpForumView );
