import { useReaderPost } from 'calypso/reader/data/reader-post';
import type { ReadPostKey } from '@automattic/api-core';

interface QueryReaderPostProps {
	postKey: Partial< ReadPostKey > | null | undefined;
}

export default function QueryReaderPost( { postKey }: QueryReaderPostProps ) {
	useReaderPost( postKey );
	return null;
}
