import { domainQuery, domainsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { globe } from '@wordpress/icons';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import { domainRoute } from '../../app/router/domains';
import HeaderBar from '../../components/header-bar';
import Switcher from '../../components/switcher';
import DomainMenu from '../domain-menu';

import './style.scss';

function Domain() {
	const { domainName } = domainRoute.useParams();
	const domains = useQuery( domainsQuery() ).data;
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<>
			<HeaderBar>
				<HStack spacing={ 3 }>
					<HeaderBar.Title>
						<Switcher
							items={ domains }
							value={ domain }
							getItemName={ ( domain ) => domain.domain }
							getItemUrl={ ( domain ) =>
								buildCurrentRouteLink( { params: { domainName: domain.domain } } )
							}
							renderItemIcon={ ( { context } ) =>
								context === 'list' ? null : (
									<Icon className="domain-icon" icon={ globe } size={ 24 } />
								)
							}
						/>
					</HeaderBar.Title>
					<DomainMenu domainName={ domain.domain } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Domain;
