import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

type SubscribersHeaderProps = {
	selectedSiteId: number | undefined;
	navigationItems: Item[];
};

const SubscribersHeader = ( { navigationItems, selectedSiteId }: SubscribersHeaderProps ) => {
	const { grandTotal, setShowAddSubscribersModal } = useSubscribersPage();

	return (
		<FixedNavigationHeader navigationItems={ navigationItems }>
			<Button
				className="add-subscribers-button"
				primary
				onClick={ () => setShowAddSubscribersModal( true ) }
			>
				<Gridicon icon="plus" size={ 24 } />
				{ translate( 'Add subscribers' ) }
			</Button>
			{ grandTotal ? <SubscribersHeaderPopover siteId={ selectedSiteId } /> : null }
		</FixedNavigationHeader>
	);
};

export default SubscribersHeader;
