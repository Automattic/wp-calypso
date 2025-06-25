import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useMergeRefs } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import SyncDropdown from 'calypso/dashboard/sites/staging-site-sync-dropdown';
import hasWpcomStagingSite from 'calypso/state/selectors/has-wpcom-staging-site';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './preview-pane-header-buttons.scss';

type Props = {
	focusRef: React.RefObject< HTMLButtonElement >;
	itemData: ItemData;
};

const PreviewPaneHeaderButtons = ( { focusRef, itemData }: Props ) => {
	const adminButtonRef = useRef< HTMLButtonElement | null >( null );
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( itemData.blogId );
	const { __ } = useI18n();

	const stagingSitesRedesign = config.isEnabled( 'hosting/staging-sites-redesign' );

	const isStagingSite = useSelector( ( state ) =>
		isSiteWpcomStaging( state, itemData.blogId ?? null )
	);
	const hasStagingSite = useSelector( ( state ) =>
		hasWpcomStagingSite( state, itemData.blogId ?? null )
	);
	const shouldShowSyncDropdown = Boolean(
		stagingSitesRedesign && ( isStagingSite || hasStagingSite )
	);

	return (
		<>
			{ shouldShowSyncDropdown && (
				<SyncDropdown
					className="item-preview__sync-dropdown"
					environment={ isStagingSite ? 'staging' : 'production' }
				/>
			) }
			<Button
				primary
				className="item-preview__admin-button"
				href={ `${ adminUrl }` }
				ref={ useMergeRefs( [ adminButtonRef, focusRef ] ) }
			>
				{ adminLabel }
			</Button>
			<GuidedTourStep
				id="site-management-panel-admin-button"
				tourId="siteManagementPanel"
				context={ adminButtonRef.current }
				title={ sprintf(
					// translators: %s is the label of the admin
					__( 'Link to %s' ),
					adminLabel
				) }
				description={ sprintf(
					// translators: %s is the label of the admin
					__(
						'Navigate seamlessly between your site management panel and %s with just one click.'
					),
					adminLabel
				) }
			/>
		</>
	);
};

export default PreviewPaneHeaderButtons;
