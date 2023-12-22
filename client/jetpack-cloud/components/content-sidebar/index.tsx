import React from 'react';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';

import './style.scss';

type Props = {
	mainContent: React.ReactNode;
	rightSidebar: React.ReactNode;
};

const ContentSidebar = ( { mainContent, rightSidebar }: Props ) => {
	return (
		<>
			<SidebarNavigation />
			<Main wideLayout className="content-sidebar">
				<div className="content-sidebar__main-content">{ mainContent }</div>
				<aside className="content-sidebar__right-sidebar">{ rightSidebar }</aside>
			</Main>
		</>
	);
};

export default ContentSidebar;
