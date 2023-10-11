import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';

// This sidebar is what people will see when they pick a site from the site
// selector. It'll display menu options like Activity Log, Backup, Social, etc.
const ManageSelectedSiteSidebar = ( { path }: { path: string } ) => (
	<>
		-- Manage selected site sidebar --
		<NewSidebar path={ path } />
	</>
);

export default ManageSelectedSiteSidebar;
