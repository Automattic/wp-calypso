import { DomainSubtype } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import useBuildCurrentRouteLink from '../../app/hooks/use-build-current-route-link';
import Switcher from '../../components/switcher';
import { Text } from '../../components/text';
import type { SwitcherProps } from '../../components/switcher';
import type { Domain, DomainSummary } from '@automattic/api-core';

import './style.scss';

const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: DomainSummary } ) => item.domain,
		enableGlobalSearch: true,
	},
];

export default function DomainSwitcher( {
	domain,
	renderToggle,
}: {
	domain: Domain;
	renderToggle?: SwitcherProps< DomainSummary >[ 'renderToggle' ];
} ) {
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
			headerTitle={ __( 'Switch domain' ) }
			getItemUrl={ ( d ) => buildCurrentRouteLink( { params: { domainName: d.domain } } ) }
			renderToggle={ renderToggle }
			renderItem={ ( { item, context } ) => (
				<Switcher.Item
					media={
						context !== 'list' ? (
							<Icon className="domain-icon" icon={ globe } size={ 24 } />
						) : undefined
					}
					title={
						<Text truncate numberOfLines={ 1 } style={ { color: 'inherit' } }>
							{ item.domain }
						</Text>
					}
				/>
			) }
		/>
	);
}
