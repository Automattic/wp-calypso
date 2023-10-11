import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';

// This sidebar is what Jetpack Manage customers will see by default as they
// navigate around Jetpack Cloud with no specific site selected.
// It'll display menu options like Sites Management, Plugin Management,
// and Purchases.
const JetpackManageSidebar = () => <NewSidebar isJetpackManage items={ [] } footer={ [] } />;

export default JetpackManageSidebar;
