import { isDomainRenewable } from '@automattic/domains-table/src/utils/is-renewable';
import {
	domainManagementLink,
	domainMappingSetup,
} from '@automattic/domains-table/src/utils/paths';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { payment, tool } from '@wordpress/icons';
import { DomainTypes } from '../../data/domains';
import type { Domain } from '../../data/types';
import type { ResponseDomain } from '@automattic/domains-table';
import type { Action } from '@wordpress/dataviews';

// TODO: Complete all actions and verify whether it works.
export const actions: Action< Domain >[] = [
	{
		id: 'renew',
		isPrimary: true,
		icon: <Icon icon={ payment } />,
		label: __( 'Renew now' ),
		callback: () => {},
		// TODO: Fix types here.
		isEligible: ( item: Domain ) => isDomainRenewable( item as unknown as ResponseDomain ),
	},
	{
		id: 'setup',
		isPrimary: true,
		icon: <Icon icon={ tool } />,
		label: __( 'Setup' ),
		callback: ( items: Domain[] ) => {
			const domain = items[ 0 ];
			const siteSlug = domain.primary_domain ? domain.domain : domain.site_slug;
			window.location.pathname = domainMappingSetup( siteSlug, domain.domain );
		},
		isEligible: ( item: Domain ) => item.type === DomainTypes.MAPPED,
	},
	{
		id: 'manage-domain',
		label: ( items: Domain[] ) => {
			const domain = items[ 0 ];
			return domain.type === DomainTypes.TRANSFER ? __( 'View transfer' ) : __( 'View settings' );
		},
		supportsBulk: false,
		callback: ( items: Domain[] ) => {
			const domain = items[ 0 ];
			const siteSlug = domain.primary_domain ? domain.domain : domain.site_slug;
			window.location.pathname = domainManagementLink( domain, siteSlug, false );
		},
		isEligible: ( item: Domain ) => {
			return item.type !== DomainTypes.WPCOM;
		},
	},
	{
		id: 'manage-dns-settings',
		label: __( 'Manage DNS' ),
		supportsBulk: false,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'manage-contact-info',
		label: __( 'Manage contact information' ),
		supportsBulk: true,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'set-primary-site-address',
		label: __( 'Make primary site address' ),
		supportsBulk: false,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'transfer-domain',
		label: __( 'Transfer to WordPress.com' ),
		supportsBulk: false,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'connect-to-site',
		label: __( 'Attach to an existing site' ),
		supportsBulk: false,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'change-site-address',
		label: __( 'Change site address' ),
		supportsBulk: false,
		callback: () => {},
		isEligible: () => false,
	},
	{
		id: 'manage-auto-renew',
		label: __( 'Manage auto-renew' ),
		supportsBulk: true,
		callback: () => {},
		isEligible: () => false,
	},
];
