/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'calypso/blocks/reader-avatar';

const ReaderAvatarExample = () => {
	const author = {
		avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		name: 'Matt',
		URL: 'http://discover.wordpress.com',
		has_avatar: true,
	};
	const siteIcon = 'https://secure.gravatar.com/blavatar/c9e4e04719c81ca4936a63ea2dce6ace?s=120';

	return (
		<div className="design-assets__group">
			<ReaderAvatar author={ author } siteIcon={ siteIcon } />
			<h4>Compact</h4>
			<ReaderAvatar author={ author } siteIcon={ siteIcon } isCompact />
		</div>
	);
};

ReaderAvatarExample.displayName = 'ReaderAvatar';

export default ReaderAvatarExample;
