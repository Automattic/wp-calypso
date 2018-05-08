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
			{ preventWidows( translate( 'Find Answers In Our Public Forums' ) ) }
		</h2>
		<p>
			{ preventWidows(
				translate(
					'Post a new question in our {{strong}}public forums{{/strong}}, ' +
						'where it may be answered by helpful community members, ' +
						'by following the link below.',
					{
						components: {
							strong: <strong />,
						},
					}
				)
			) }
		</p>
		<Button href={ FORUM_LINK } target="_blank" rel="noopener noreferrer" primary>
			{ translate( 'Support Forums' ) }
		</Button>
	</div>
);

export default localize( InlineHelpForumView );
