/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

/**
 * Style dependencies
 */
import './continue-as-user.scss';

export default function ContinueAsUser( { user, redirectUrl } ) {
	const translate = useTranslate();

	if ( ! user || ! redirectUrl ) {
		return null;
	}

	const userName = user.display_name || user.username;
	const redirectLink = (
		<a href={ redirectUrl }>
			<Gravatar user={ user } size={ 16 } />
			{ userName }
		</a>
	);

	return (
		<div className="continue-as-user">
			{ translate( 'or continue as {{userName/}}', {
				components: { userName: redirectLink },
				comment: 'Alternative link under login header, skips login to continue as current user.',
			} ) }
		</div>
	);
}
