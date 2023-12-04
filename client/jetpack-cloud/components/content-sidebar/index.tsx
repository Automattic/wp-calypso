import './style.scss';
import React from 'react';

type Props = {
	mainContent: React.ReactNode;
	rightSidebar: React.ReactNode;
};

const ContentSidebar = ( { mainContent, rightSidebar }: Props ) => {
	return (
		<div className="jetpack-cloud-content-sidebar">
			<div className="main-content">{ mainContent }</div>
			<aside className="right-sidebar">{ rightSidebar }</aside>
		</div>
	);
};

export default ContentSidebar;
