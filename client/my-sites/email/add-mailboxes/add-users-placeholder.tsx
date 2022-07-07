import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

const AddEmailAddressesCardPlaceholder = (): JSX.Element => {
	return (
		<VerticalNav className="add-mailboxes__add-mailboxes-placeholder">
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
			<VerticalNavItem isPlaceholder />
		</VerticalNav>
	);
};

export default AddEmailAddressesCardPlaceholder;
