import { Button } from '@automattic/components';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDiscoverNavTab } from 'calypso/state/reader/discover/actions';
import { getSelectedTab } from 'calypso/state/reader/discover/selectors';
// make redux selectors for DiscoverNavigation
// selector to get selectedTab
// dispatch to set selectedTab
const DiscoverNavItem = ( { title, slug } ) => {
	const dispatch = useDispatch();
	// isSelected connected to redux to determine if this is the selected item.
	const selectedTab = useSelector( getSelectedTab );
	const isSelected = slug === selectedTab;
	// onSelect map a dispatch to change redux state.
	const onSelect = () => dispatch( setSelectedDiscoverNavTab( slug ) );

	return (
		<Button
			primary={ isSelected }
			onClick={ onSelect }
			className="discover-stream__navigation-item"
		>
			{ title }
		</Button>
	);
};

export default DiscoverNavItem;
