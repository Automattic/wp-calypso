import { fetchReaderThumbnail } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { ReaderThumbnailService } from '@automattic/api-core';

export const readerThumbnailQuery = (
	service: ReaderThumbnailService | null | undefined,
	id: string | null | undefined
) =>
	queryOptions( {
		queryKey: [ 'read', 'thumbnail', service, id ],
		queryFn: () => fetchReaderThumbnail( { service: service!, id: id! } ),
		enabled: !! service && !! id,
		staleTime: Infinity,
		meta: { persist: false },
	} );
