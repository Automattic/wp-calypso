import { CompactCard } from '@automattic/components';
import HeaderCake from 'calypso/components/header-cake';

export const renderDisallowed = ( translate, siteSlug ) => {
	return (
		<>
			<HeaderCake backHref={ `/me/quickstart/${ siteSlug }/book` }>
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
