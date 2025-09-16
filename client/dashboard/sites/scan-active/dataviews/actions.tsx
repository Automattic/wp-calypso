import { Icon } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import type { Threat } from '@automattic/api-core';

export function getActions(): Action< Threat >[] {
	return [
		{
			id: 'fix',
			isPrimary: true,
			icon: <Icon icon={ tool } />,
			label: __( 'Fix threat' ),
			modalHeader: __( 'Fix threat' ),
			supportsBulk: true,
			// @TODO: render the proper fix modal
			RenderModal: ( { items } ) => {
				if ( items.length > 1 ) {
					return <p>Fix threats { items.map( ( threat ) => threat.id ).join( ', ' ) }</p>;
				}

				return <p>Fix threat #{ items[ 0 ].id }</p>;
			},
			isEligible: ( threat: Threat ) => !! threat.fixable,
		},
		{
			id: 'ignore',
			label: __( 'Ignore threat' ),
			modalHeader: __( 'Ignore threat' ),
			supportsBulk: false,
			// @TODO: render the proper ignore modal
			RenderModal: ( { items } ) => <p>Ignore threat { items[ 0 ].id }</p>,
		},
		{
			id: 'view_details',
			label: __( 'View details' ),
			modalHeader: __( 'Active threat' ),
			supportsBulk: false,
			// @TODO: render the proper details modal
			RenderModal: ( { items } ) => <p>Details of thread { items[ 0 ].id }</p>,
		},
		{
			id: 'view_source',
			label: __( 'View vulnerability source' ),
			supportsBulk: false,
			callback: ( items: Threat[] ) => {
				const threat = items[ 0 ];
				if ( threat.source ) {
					window.open( threat.source, '_blank' );
				}
			},
			isEligible: ( threat: Threat ) => !! threat.source,
		},
	];
}
