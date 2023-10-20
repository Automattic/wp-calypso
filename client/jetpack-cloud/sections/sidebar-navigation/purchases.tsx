import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';

// This sidebar is what Jetpack Manage customers will see when they select the
// Purchases item from the top-level navigation sidebar. It'll display options
// like Licenses, Invoices, Billing, etc.
// FIXME: Add menu items
const PurchasesSidebar = () => {
	return <NewSidebar path="/partner-portal" menuItems={ [] } />;
};

export default PurchasesSidebar;
