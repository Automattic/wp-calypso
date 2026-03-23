import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, useNavigator } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense, lazy, useMemo } from 'react';
import { useAppContext } from '../../app/context';
import { SidebarBackButton, SidebarMenu } from '../../components/sidebar';
import { canSwitchEnvironment } from '../features';
import EnvironmentSwitcher from '../site/environment-switcher-v2';
import SiteMenu from '../site-menu';

export default function SiteSidebar() {
	const { params } = useNavigator();
	const siteSlug = params.siteSlug as string;

	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	const { components } = useAppContext();
	const SiteSwitcher = useMemo( () => lazy( components.siteSwitcher ), [ components ] );

	if ( ! site ) {
		return null;
	}

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/sites">{ __( 'Back to Sites' ) }</SidebarBackButton>
			<VStack spacing={ 4 }>
				<Suspense fallback={ null }>
					<SidebarMenu>
						<SiteSwitcher />
						{ canSwitchEnvironment( site ) && <EnvironmentSwitcher site={ site } /> }
					</SidebarMenu>
				</Suspense>
				<SiteMenu site={ site } />
			</VStack>
		</VStack>
	);
}
