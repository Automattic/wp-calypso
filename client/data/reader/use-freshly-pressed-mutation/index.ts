import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type ApiResponse = {
	body: boolean;
};

const request = async ( blogId: number, postId: number ): Promise< ApiResponse > => {
	return ( await wpcom.req.post( {
		path: `/freshly-pressed/suggest/${ blogId }/${ postId }`,
		apiNamespace: 'wpcom/v2',
	} ) ) as unknown as ApiResponse;
};

interface Options {
	onSuccess?: () => void;
}
interface Params {
	blogId: number;
	postId: number;
}

export const useFreshlyPressedMutation = ( params: Params, options?: Options ) => {
	return useMutation( {
		mutationKey: [ 'freshly-pressed', 'suggest', params.blogId, params.postId ],
		mutationFn: () => request( params.blogId, params.postId ),
		onSuccess: options?.onSuccess,
	} );
};
