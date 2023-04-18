import { useTranslate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';

export type CampaignsFilterType = 'all' | 'active' | 'in_moderation' | 'rejected';

interface Props {
	campaignsFilter: CampaignsFilterType;
	handleChangeFilter: ( type: CampaignsFilterType ) => void;
}

export default function CampaignsFilter( props: Props ) {
	const translate = useTranslate();

	const { handleChangeFilter, campaignsFilter } = props;
	return (
		<SegmentedControl compact primary>
			<SegmentedControl.Item
				selected={ campaignsFilter === 'all' }
				onClick={ handleChangeFilter( 'all' ) }
			>
				{ translate( 'All' ) }
			</SegmentedControl.Item>
			<SegmentedControl.Item
				selected={ campaignsFilter === 'active' }
				onClick={ handleChangeFilter( 'active' ) }
			>
				{ translate( 'Active', { context: 'comment status' } ) }
			</SegmentedControl.Item>
			<SegmentedControl.Item
				selected={ campaignsFilter === 'in_moderation' }
				onClick={ handleChangeFilter( 'in_moderation' ) }
			>
				{ translate( 'In moderation', { context: 'comment status' } ) }
			</SegmentedControl.Item>
			<SegmentedControl.Item
				selected={ campaignsFilter === 'rejected' }
				onClick={ handleChangeFilter( 'rejected' ) }
			>
				{ translate( 'Rejected', { context: 'comment status' } ) }
			</SegmentedControl.Item>
		</SegmentedControl>
	);
}
