import React from 'react';
import DiscussionMain from 'calypso/my-sites/site-settings/settings-discussion/main';

export function discussion( context, next ) {
	context.primary = React.createElement( DiscussionMain );
	next();
}
