import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, useNavigator } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import { SidebarBackButton } from '../../components/sidebar';
import DomainMenu from '../domain-menu';
import DomainSwitcher from '../domain-switcher';

export default function DomainSidebar() {
	const { params } = useNavigator();
	const domainName = params.domainName as string;

	const { data: domain } = useQuery( domainQuery( domainName ) );

	if ( ! domain ) {
		return null;
	}

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/domains">{ __( 'Back to Domains' ) }</SidebarBackButton>
			<VStack spacing={ 4 }>
				<Suspense fallback={ null }>
					<DomainSwitcher domain={ domain } />
				</Suspense>
				<DomainMenu domainName={ domainName } />
			</VStack>
		</VStack>
	);
}
