import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { LoadingBar } from 'calypso/components/loading-bar';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const StyledLoadingBar = styled( LoadingBar )( {
	marginBottom: '1em',
} );

type CardContentProps = {
	progress: number;
	siteToSync: 'production' | 'staging' | null;
};

export const StagingSiteSyncLoadingBarCardContent = ( {
	progress,
	siteToSync,
}: CardContentProps ) => {
	const translate = useTranslate();
	const siteOwnerId = useSelector( ( state ) => getSelectedSite( state )?.site_owner );
	const currentUserId = useSelector( getCurrentUserId );
	const isOwner = siteOwnerId === currentUserId;

	let message;
	if ( siteToSync === 'production' ) {
		message = isOwner
			? translate( 'We are updating your production site. We’ll email you once it is ready.' )
			: translate(
					'We are updating the production site. We’ll email the site owner once it is ready.'
			  );
	} else if ( siteToSync === 'staging' ) {
		message = isOwner
			? translate( 'We are updating your staging site. We’ll email you once it is ready.' )
			: translate(
					'We are updating the staging site. We’ll email the site owner once it is ready.'
			  );
	} else {
		message = isOwner
			? translate( 'We are updating your site. We’ll email you once it is ready.' )
			: translate( 'We are updating the site. We’ll email the site owner once it is ready.' );
	}

	return (
		<div data-testid="syncing-site-content">
			<StyledLoadingBar progress={ progress } />
			<p>{ message }</p>
		</div>
	);
};
