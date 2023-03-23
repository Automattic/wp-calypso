import { Subscriber } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

export function useInProgressState() {
	const { addSelector, importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );
		return {
			addSelector: subscriber.getAddSubscribersSelector(),
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	return addSelector?.inProgress || importSelector?.inProgress;
}
