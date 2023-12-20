import React from 'react';
import Main from 'calypso/components/main';

import './style.scss';

type Props = {
	mainContent: React.ReactNode;
	rightSidebar: React.ReactNode;
};

const ContentSidebar = ( { mainContent, rightSidebar }: Props ) => {
	return (
		// todo: We have to add here the header for the mobile menu
		<Main wideLayout className="content-sidebar">
			<div className="content-sidebar__main-content">{ mainContent }</div>
			<aside className="content-sidebar__right-sidebar">{ rightSidebar }</aside>
		</Main>
	);
};

export default ContentSidebar;
