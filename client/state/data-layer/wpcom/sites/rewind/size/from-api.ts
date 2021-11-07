/**
 * Internal dependencies
 */
import type { RewindSizeInfo } from 'calypso/state/rewind/size/types';

type ApiResponse = {
	ok: boolean;
	error: string;
	size: number;
};

const fromApi = ( { size }: ApiResponse ): RewindSizeInfo => ( {
	bytesUsed: size,
} );

export default fromApi;
