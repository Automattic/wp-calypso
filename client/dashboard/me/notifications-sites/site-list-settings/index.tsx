import { Site } from '@automattic/api-core';
import { sitesQuery } from '@automattic/api-queries';
import { useFuzzySearch } from '@automattic/search';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	SearchControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useDeferredValue, useState } from 'react';
import { CollapsibleCard } from '../collapsible-card';
import { SitePreview } from '../site-preview';
import { SiteSettings } from '../site-settings';

import './index.scss';

export const SiteListSettings = () => {
	const [ search, setSearch ] = useState< string | undefined >();
	const { data: sites } = useSuspenseQuery( {
		...sitesQuery( { include_a8c_owned: true, site_visibility: 'visible' } ),
	} );

	const deferredSearch = useDeferredValue( search );

	const filteredSites = useFuzzySearch< Site >( {
		data: sites,
		keys: [ 'name', 'URL' ],
		query: deferredSearch,
	} );

	const handleSearchChange = ( value: string | undefined ) => {
		setSearch( value );
	};

	return (
		<VStack spacing={ 8 } className="site-list-settings">
			<SearchControl
				value={ search }
				placeholder={ __( 'Search for a site' ) }
				onChange={ handleSearchChange }
				__nextHasNoMarginBottom
			/>
			<VStack spacing={ 4 }>
				{ filteredSites.map( ( site: Site ) => (
					<CollapsibleCard key={ site.ID } header={ <SitePreview site={ site } /> }>
						<SiteSettings siteId={ site.ID } className="site-list-settings__site-settings" />
					</CollapsibleCard>
				) ) }
				{ filteredSites.length === 0 && (
					<Card>
						<CardBody>
							{ createInterpolateElement(
								sprintf(
									// translators: %s is the search query
									__( 'No sites found with the search query <strong>%(search)s</strong>.' ),
									{
										search: search,
									}
								),
								{
									strong: <strong />,
								}
							) }
						</CardBody>
					</Card>
				) }
			</VStack>
		</VStack>
	);
};
