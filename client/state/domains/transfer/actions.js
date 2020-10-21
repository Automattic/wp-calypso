/**
 * Internal dependencies
 */
import { DOMAIN_TRANSFER_IPS_TAG_SAVE, DOMAIN_TRANSFER_UPDATE } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/transfer/index.js';
import 'calypso/state/domains/init';

export const saveDomainIpsTag = ( domain, selectedRegistrar ) => ( {
	type: DOMAIN_TRANSFER_IPS_TAG_SAVE,
	domain,
	ipsTag: selectedRegistrar.tag,
	selectedRegistrar,
} );

export const updateDomainTransfer = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_UPDATE,
	domain,
	options,
} );
