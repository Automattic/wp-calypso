import { isDomainRenewable } from '@automattic/domains-table/src/utils/is-renewable'; // eslint-disable-line
import { domainManagementLink as getDomainManagementLink } from '@automattic/domains-table/src/utils/paths'; // eslint-disable-line
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardHeader,
	CardBody,
	Icon,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { payment, tool } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { type as domainTypes } from 'calypso/lib/domains/constants'; // eslint-disable-line
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { SectionHeader } from '../../components/section-header';
import type { Site, SiteDomain } from '../../data/types';
import type { Action, Field, View } from '@wordpress/dataviews';

const fields: Field< SiteDomain >[] = [
	{
		id: 'domain',
		label: __( 'Domains' ),
		enableHiding: false,
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: SiteDomain } ) => item.domain,
	},
	{
		id: 'expiry',
		label: __( 'Expires/Renews on' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: SiteDomain } ) =>
			item.expiry ? dateI18n( 'F j, Y', item.expiry ) : <Text color="#CCCCCC">-</Text>,
	},
];

const actions: Action< SiteDomain >[] = [
	{
		id: 'renew',
		isPrimary: true,
		icon: <Icon icon={ payment } />,
		label: __( 'Renew now' ),
		callback: () => {},
		isEligible: ( item: SiteDomain ) => isDomainRenewable( item ),
	},
	{
		id: 'setup',
		isPrimary: true,
		icon: <Icon icon={ tool } />,
		label: __( 'Setup' ),
		callback: ( items: SiteDomain[] ) => {
			const domain = items[ 0 ];
			const primaryDomain = items.find( ( item ) => item.primary_domain ) ?? domain;
			window.location.pathname = `/domains/mapping/${ primaryDomain.domain }/setup/${ domain.domain }`;
		},
		isEligible: ( item: SiteDomain ) => item.type === domainTypes.MAPPED,
	},
	{
		id: 'manage-domain',
		label: ( items: SiteDomain[] ) => {
			const domain = items[ 0 ];
			return domain.type === domainTypes.TRANSFER ? __( 'View transfer' ) : __( 'View settings' );
		},
		callback: ( items: SiteDomain[] ) => {
			const domain = items[ 0 ];
			const primaryDomain = items.find( ( item ) => item.primary_domain ) ?? domain;
			window.location.pathname = getDomainManagementLink( domain, primaryDomain.domain, false );
		},
		isEligible: ( item: SiteDomain ) => item.wpcom_domain,
	},
];

const initialViewState: View = {
	filters: [],
	sort: {
		field: 'domain',
		direction: 'asc',
	},
	page: 1,
	perPage: 10,
	search: '',
	type: 'table',
	showMedia: false,
	titleField: 'domain',
	fields: [ 'expiry' ],
};

// Default layouts
const defaultLayouts = {
	table: {},
};

const getDomainId = ( domain: SiteDomain ): string => {
	return `${ domain.domain }-${ domain.blog_id }`;
};

export default function DomainsCard( {
	site,
	type = 'table',
}: {
	site: Site;
	type?: View[ 'type' ];
} ) {
	const [ view, setView ] = useState( { ...initialViewState, type } );
	const { data: siteDomains, isLoading } = useQuery( siteDomainsQuery( site.ID ) );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		siteDomains ?? [],
		view,
		fields
	);

	return (
		<Card>
			<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
				<SectionHeader
					title={ __( 'Domains' ) }
					level={ 3 }
					actions={
						<>
							<Button
								variant="tertiary"
								href={ addQueryArgs( `/domains/add/use-my-domain/${ site.slug }`, {
									redirect_to: window.location.pathname,
								} ) }
							>
								{ __( 'Transfer domain' ) }
							</Button>
							<Button
								variant="primary"
								href={ addQueryArgs( `/domains/add/${ site.slug }`, {
									redirect_to: window.location.pathname,
								} ) }
							>
								{ __( 'Add domain' ) }
							</Button>
						</>
					}
				/>
			</CardHeader>
			<CardBody>
				<DataViews< SiteDomain >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( newView ) => setView( () => newView ) }
					view={ view }
					actions={ actions }
					search={ false }
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ isLoading }
					defaultLayouts={ defaultLayouts }
				/>
			</CardBody>
		</Card>
	);
}
