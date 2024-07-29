import React from 'react';

import './style.scss';

type Props = {
	mainContent: React.ReactNode;
	rightSidebar: React.ReactNode;
};

const ContentSidebar = ( { mainContent, rightSidebar }: Props ) => {
	return (
		<div className="content-sidebar">
			<div className="content-sidebar__main-content">{ mainContent }</div>
			<aside className="content-sidebar__right-sidebar">{ rightSidebar }</aside>
		</div>
	);
};

export default ContentSidebar;
