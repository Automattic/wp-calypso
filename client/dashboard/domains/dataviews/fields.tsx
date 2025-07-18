import { __experimentalText as Text } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import type { Domain } from '../../data/types';
import type { Field } from '@wordpress/dataviews';

const IneligibleIndicator = () => <Text color="#CCCCCC">-</Text>;

export const fields: Field< Domain >[] = [
	{
		id: 'domain',
		label: __( 'Domains' ),
		enableHiding: false,
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: Domain } ) => item.domain,
	},
	{
		id: 'type',
		label: __( 'Type' ),
		enableHiding: false,
		enableSorting: false,
	},
	// {
	// 	id: 'owner',
	// 	label: __( 'Owner' ),
	// 	enableHiding: false,
	// 	enableSorting: true,
	// },
	{
		id: 'blog_name',
		label: __( 'Site' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => item.blog_name ?? '',
	},
	// {
	// 	id: 'ssl_status',
	// 	label: __( 'SSL' ),
	// 	enableHiding: false,
	// 	enableSorting: true,
	// },
	{
		id: 'expiry',
		label: __( 'Expires/Renews on' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) =>
			item.expiry ? dateI18n( 'F j, Y', item.expiry ) : '',
		render: ( { item } ) =>
			item.expiry ? dateI18n( 'F j, Y', item.expiry ) : <IneligibleIndicator />,
	},
	{
		id: 'domain_status',
		label: __( 'Status' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => item.domain_status?.status ?? '',
		render: ( { item } ) => item.domain_status?.status ?? <IneligibleIndicator />,
	},
];
