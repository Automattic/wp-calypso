import {
	DOMAIN_NOTICES_STATUS_REQUEST,
	DOMAIN_NOTICES_STATUS_REQUEST_COMPLETED,
	DOMAIN_NOTICES_STATUS_DISMISS,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/notices/index.js';

export const requestDomainNoticesStatus = ( domainName ) => ( {
	type: DOMAIN_NOTICES_STATUS_REQUEST,
	domainName: domainName,
} );

export const requestDomainNoticesStatusCompleted = ( domainName, notices ) => ( {
	type: DOMAIN_NOTICES_STATUS_REQUEST_COMPLETED,
	domainName,
	notices,
} );

export const dismissDomainNotice = ( domainName, noticeType ) => ( {
	type: DOMAIN_NOTICES_STATUS_DISMISS,
	domainName,
	noticeType,
} );
