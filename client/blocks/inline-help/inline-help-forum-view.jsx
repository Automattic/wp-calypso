/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import { Button } from '@automattic/components';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { localizeUrl } from 'calypso/lib/i18n-utils';

const trackForumOpen = () =>
	recordTracksEvent( 'calypso_inlinehelp_forums_open', {
		location: 'inline-help-popover',
	} );

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
			href={ localizeUrl( 'https://en.forums.wordpress.com/' ) }
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
