import { createHigherOrderComponent } from '@wordpress/compose';
import React from 'react';
import useDeleteMediaMutation from './use-delete-media-mutation';

const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { deleteMedia } = useDeleteMediaMutation();
		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);

export default withDeleteMedia;
