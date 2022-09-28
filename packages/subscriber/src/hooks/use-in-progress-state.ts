import { useSelect } from '@wordpress/data';
import { SUBSCRIBER_STORE } from '../store';

export function useInProgressState() {
	const addSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getAddSubscribersSelector() );
	const importSelector = useSelect( ( s ) => s( SUBSCRIBER_STORE ).getImportSubscribersSelector() );

	return addSelector?.inProgress || importSelector?.inProgress;
}
