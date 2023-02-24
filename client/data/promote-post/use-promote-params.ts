import { useSelector } from 'react-redux';
import { useRouteModal } from 'calypso/lib/route-modal';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const blazePressWidgetKey = 'blazepress-widget';

type UsePromoteParams = {
	selectedSiteId: number;
	selectedPostId: string;
	isModalOpen: boolean;
	keyValue: string;
};

const usePromoteParams = (): UsePromoteParams => {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID || 0;
	const currentQuery = useSelector( getCurrentQueryArguments );
	const keyValue = ( currentQuery && ( currentQuery[ blazePressWidgetKey ] as string ) ) || '';
	const selectedPostId = keyValue?.split( '-' )[ 1 ];
	const { isModalOpen } = useRouteModal( blazePressWidgetKey, keyValue );

	return {
		selectedSiteId,
		selectedPostId,
		isModalOpen,
		keyValue,
	};
};

export default usePromoteParams;
