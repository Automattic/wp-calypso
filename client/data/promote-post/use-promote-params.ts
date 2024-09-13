import { useRouteModal } from 'calypso/lib/route-modal';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const blazePressWidgetKey = 'blazepress-widget';

type UsePromoteParams = {
	selectedSiteId: number;
	selectedPostId: string;
	selectedCampaignId: string;
	isModalOpen: boolean;
	keyValue: string;
};

const usePromoteParams = (): UsePromoteParams => {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID || 0;
	const currentQuery = useSelector( getCurrentQueryArguments );
	const keyValue = ( currentQuery && ( currentQuery[ blazePressWidgetKey ] as string ) ) || '';

	const type = keyValue?.split( '-' )[ 0 ];

	let selectedPostId = '';
	let selectedCampaignId = '';

	if ( type === 'post' ) {
		selectedPostId = keyValue?.split( '-' )[ 1 ];
	} else if ( type === 'campaign' ) {
		selectedCampaignId = keyValue?.split( '-' )[ 1 ];
	}

	const { isModalOpen } = useRouteModal( blazePressWidgetKey, keyValue );

	return {
		selectedSiteId,
		selectedPostId,
		selectedCampaignId,
		isModalOpen,
		keyValue,
	};
};

export default usePromoteParams;
