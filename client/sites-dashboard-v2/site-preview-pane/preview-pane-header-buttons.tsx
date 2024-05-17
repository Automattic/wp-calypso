import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';

type Props = {
	focusRef: React.RefObject< HTMLButtonElement >;
	itemData: ItemData;
	closeSitePreviewPane?: () => void;
};

const PreviewPaneHeaderButtons = ( { focusRef, closeSitePreviewPane, itemData }: Props ) => {
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( itemData.blogId );
	const { __ } = useI18n();
	return (
		<>
			<Button onClick={ closeSitePreviewPane } className="item-preview__close-preview-button">
				{ __( 'Close' ) }
			</Button>
			<Button
				primary
				className="item-preview__admin-button"
				href={ `${ adminUrl }` }
				ref={ focusRef }
			>
				{ adminLabel }
			</Button>
		</>
	);
};

export default PreviewPaneHeaderButtons;
