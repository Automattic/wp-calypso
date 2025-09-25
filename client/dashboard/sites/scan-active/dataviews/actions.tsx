import { Icon } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { FixThreatModal } from '../../scan/components/fix-threat-modal';
import { IgnoreThreatModal } from '../../scan/components/ignore-threat-modal';
import type { Threat } from '@automattic/api-core';

export function getActions( siteId: number ): Action< Threat >[] {
	return [
		{
			id: 'fix',
			isPrimary: true,
			icon: <Icon icon={ tool } />,
			label: __( 'Fix threat' ),
			modalHeader: __( 'Fix threat' ),
			supportsBulk: true,
			RenderModal: ( { items, closeModal } ) => (
				<FixThreatModal items={ items } closeModal={ closeModal } siteId={ siteId } />
			),
			isEligible: ( threat: Threat ) => !! threat.fixable,
		},
		{
			id: 'ignore',
			label: __( 'Ignore threat' ),
			modalHeader: __( 'Ignore threat' ),
			supportsBulk: false,
			RenderModal: ( { items, closeModal } ) => (
				<IgnoreThreatModal items={ items } closeModal={ closeModal } siteId={ siteId } />
			),
		},
	];
}
