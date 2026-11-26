import { Icon } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { isSelfHostedJetpackConnected } from '../../../utils/site-types';
import { BulkFixThreatsModal } from '../components/bulk-fix-threats-modal';
import { FixThreatModal } from '../components/fix-threat-modal';
import { IgnoreThreatModal } from '../components/ignore-threat-modal';
import { getViewDetailsAction } from './view-details-action';
import type { Threat, Site } from '@automattic/api-core';

export function getActions( site: Site, threatCount: number ): Action< Threat >[] {
	// The action could be triggered directly, with no previous selection, hence we should consider 0 threats as well.
	const fixTitle = threatCount <= 1 ? __( 'Fix threat' ) : __( 'Fix threats' );
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
					return <FixThreatModal items={ items } closeModal={ closeModal } site={ site } />;
				}
				return <BulkFixThreatsModal items={ items } closeModal={ closeModal } site={ site } />;
			},
			isEligible: ( threat: Threat ) => !! threat.fixable,
		},
		{
			id: 'ignore',
			label: __( 'Ignore threat' ),
			modalHeader: __( 'Ignore threat' ),
			supportsBulk: false,
			isEligible: () => isSelfHostedJetpackConnected( site ),
			RenderModal: ( { items, closeModal } ) => (
				<IgnoreThreatModal items={ items } closeModal={ closeModal } site={ site } />
			),
		},
		getViewDetailsAction( site ),
	];
}
