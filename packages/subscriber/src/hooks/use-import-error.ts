import { Subscriber } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

export function useImportError() {
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );
		return {
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	return importSelector?.error;
}
