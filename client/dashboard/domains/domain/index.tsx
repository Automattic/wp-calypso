import { DomainSubtype } from '@automattic/api-core';
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
import type { DomainSummary } from '@automattic/api-core';
import './style.scss';

function Domain() {
	const { domainName } = domainRoute.useParams();
	const domains = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		},
	} ).data;
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	const searchableFields = [
		{
			id: 'name',
			getValue: ( { item }: { item: DomainSummary } ) => item.domain,
			enableGlobalSearch: true,
		},
	];

	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<>
			<HeaderBar>
				<HStack spacing={ 3 }>
					<HeaderBar.Title>
						<Switcher
							items={ domains }
							value={ domain }
							searchableFields={ searchableFields }
							getItemUrl={ ( domain ) =>
								buildCurrentRouteLink( { params: { domainName: domain.domain } } )
							}
							renderItemMedia={ ( { context } ) =>
								context === 'list' ? null : (
									<Icon className="domain-icon" icon={ globe } size={ 24 } />
								)
							}
							renderItemTitle={ ( { item } ) => (
								<span
									style={ {
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									} }
								>
									{ item.domain }
								</span>
							) }
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
