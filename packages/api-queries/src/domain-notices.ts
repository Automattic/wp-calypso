import { setDomainNotice } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainDiagnosticsQuery } from './domain-diagnostics';
import { queryClient } from './query-client';

export const domainNoticeMutation = ( domainName: string, noticeType: string ) =>
	mutationOptions( {
		mutationFn: ( noticeMessage: string ) =>
			setDomainNotice( domainName, noticeType, noticeMessage ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainDiagnosticsQuery( domainName ) );
		},
	} );
