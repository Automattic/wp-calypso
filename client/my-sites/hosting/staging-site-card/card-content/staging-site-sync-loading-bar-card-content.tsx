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
	const currentUserId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isOwner = siteOwnerId === currentUserId;

	const message = isOwner
		? translate( 'We are updating your %s site. We’ll email you once it is ready.', {
				args: [ siteToSync ?? '' ],
		  } )
		: translate( 'We are updating the %s site. We’ll email the site owner once it is ready.', {
				args: [ siteToSync ?? '' ],
		  } );
	return (
		<div data-testid="syncing-site-content">
			<StyledLoadingBar progress={ progress } />
			<p>{ message }</p>
		</div>
	);
};
