import { Icon } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __, _n } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { BulkFixThreatsModal } from '../../scan/components/bulk-fix-threats-modal';
import { FixThreatModal } from '../../scan/components/fix-threat-modal';
import { IgnoreThreatModal } from '../../scan/components/ignore-threat-modal';
import type { Threat } from '@automattic/api-core';

export function getActions( siteId: number, threatCount: number ): Action< Threat >[] {
	const fixTitle = _n( 'Fix threat', 'Fix threats', threatCount );
	return [
		{
			id: 'fix',
			isPrimary: true,
			icon: <Icon icon={ tool } />,
			label: fixTitle,
			modalHeader: fixTitle,
			supportsBulk: true,
			RenderModal: ( { items, closeModal } ) => {
				if ( items.length === 1 ) {
					return <FixThreatModal items={ items } closeModal={ closeModal } siteId={ siteId } />;
				}
				return <BulkFixThreatsModal items={ items } closeModal={ closeModal } siteId={ siteId } />;
			},
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
