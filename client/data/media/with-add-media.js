import { createHigherOrderComponent } from '@wordpress/compose';
import { useAddMedia } from './use-add-media';

export const withAddMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const addMedia = useAddMedia();
		return <Wrapped { ...props } addMedia={ addMedia } />;
	},
	'WithAddMedia'
);
