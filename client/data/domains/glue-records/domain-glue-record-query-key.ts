import { QueryKey } from '@tanstack/react-query';

export function domainGlueRecordQueryKey( domainName: string ): QueryKey {
	return [ 'glue-record', domainName ];
}
