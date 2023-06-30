import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

type SubscribersHeaderProps = {
	selectedSiteId: number | null;
	navigationItems: Item[];
	setShowAddSubscribersModal: React.Dispatch< React.SetStateAction< boolean > >;
};

const SubscribersHeader = ( {
	navigationItems,
	selectedSiteId,
	setShowAddSubscribersModal,
}: SubscribersHeaderProps ) => {
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
			<SubscribersHeaderPopover siteId={ selectedSiteId } />
		</FixedNavigationHeader>
	);
};

export default SubscribersHeader;
