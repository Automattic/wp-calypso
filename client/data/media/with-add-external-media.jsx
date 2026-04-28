import { createHigherOrderComponent } from '@wordpress/compose';
import { useAddExternalMedia } from './use-add-external-media';

export const withAddExternalMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const addExternalMedia = useAddExternalMedia();
		return <Wrapped { ...props } addExternalMedia={ addExternalMedia } />;
	},
	'WithAddExternalMedia'
);
