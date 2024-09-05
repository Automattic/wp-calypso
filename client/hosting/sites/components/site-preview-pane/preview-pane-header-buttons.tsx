import { Button } from '@automattic/components';
import { useMergeRefs } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useRef } from 'react';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import type { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

type Props = {
	focusRef: React.RefObject< HTMLButtonElement >;
	itemData: ItemData;
	closeSitePreviewPane?: () => void;
	sectionName: string; // Add this line
};

const PreviewPaneHeaderButtons = ( {
	focusRef,
	closeSitePreviewPane,
	itemData,
	sectionName,
}: Props ) => {
	const adminButtonRef = useRef< HTMLButtonElement | null >( null );
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( itemData.blogId );
	const { __ } = useI18n();

	const isHostingOverview = sectionName === 'dotcom-hosting';

	return (
		<>
			<Button onClick={ closeSitePreviewPane } className="item-preview__close-preview-button">
				{ __( 'Close' ) }
			</Button>
			<Button
				primary={ isHostingOverview }
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
