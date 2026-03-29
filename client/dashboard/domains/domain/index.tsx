import { domainQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { domainRoute } from '../../app/router/domains';
import HeaderBar from '../../components/header-bar';
import DomainMenu from '../domain-menu';
import DomainSwitcher from '../domain-switcher';

function Domain() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<>
			{ ! isEnabled( 'dashboard/omnibar' ) && (
				<HeaderBar>
					<HStack spacing={ 3 }>
						<HeaderBar.Title>
							<DomainSwitcher domain={ domain } />
						</HeaderBar.Title>
						<DomainMenu domainName={ domain.domain } />
					</HStack>
				</HeaderBar>
			) }
			<Outlet />
		</>
	);
}

export default Domain;
