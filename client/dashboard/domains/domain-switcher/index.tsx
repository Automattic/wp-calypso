import { DomainSubtype } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { globe } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import Switcher from '../../components/switcher';
import type { Domain, DomainSummary } from '@automattic/api-core';

import './style.scss';

const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: DomainSummary } ) => item.domain,
		enableGlobalSearch: true,
	},
];

export default function DomainSwitcher( { domain }: { domain: Domain } ) {
	const { queries } = useAppContext();
	const domains = useQuery( {
		...queries.domainsQuery(),
		select: ( data ) => {
			return data.filter( ( d ) => d.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		},
	} ).data;

	const buildCurrentRouteLink = useBuildCurrentRouteLink();

	return (
		<Switcher
			items={ domains }
			value={ domain }
			searchableFields={ searchableFields }
			getItemUrl={ ( d ) => buildCurrentRouteLink( { params: { domainName: d.domain } } ) }
			renderItemMedia={ ( { context } ) =>
				context === 'list' ? null : <Icon className="domain-icon" icon={ globe } size={ 24 } />
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
	);
}
