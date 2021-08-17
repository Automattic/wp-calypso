/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'calypso/components/header-cake';
import { CompactCard } from '@automattic/components';

export const renderDisallowed = ( translate, siteSlug ) => {
	return (
		<>
			<HeaderCake backHref={ `/me/concierge/${ siteSlug }/book` }>
				{ translate( 'Reschedule or cancel' ) }
			</HeaderCake>
			<CompactCard>
				<div>
					{ translate(
						'Sorry, you cannot reschedule or cancel less than 60 minutes before the session.'
					) }
				</div>
			</CompactCard>
		</>
	);
};
