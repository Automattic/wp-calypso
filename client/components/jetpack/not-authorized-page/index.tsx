import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';

const NotAuthorizedPage: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main>
			{ isJetpackCloud() && <SidebarNavigation /> }
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'You are not authorized to view this page' ) }
			/>
		</Main>
	);
};

export default NotAuthorizedPage;
