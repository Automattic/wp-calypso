import { forwardRef } from 'react';
import { usePostLikeMutation } from './use-post-like-mutation';

export const withPostLikeMutation = ( WrappedComponent ) => {
	const WithPostLikeMutation = forwardRef( ( props, ref ) => {
		const { likePost, unlikePost } = usePostLikeMutation();
		return (
			<WrappedComponent
				{ ...props }
				ref={ ref }
				like={ likePost }
				unlike={ unlikePost }
				likePost={ likePost }
				unlikePost={ unlikePost }
			/>
		);
	} );

	const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	WithPostLikeMutation.displayName = `withPostLikeMutation(${ name })`;

	return WithPostLikeMutation;
};
