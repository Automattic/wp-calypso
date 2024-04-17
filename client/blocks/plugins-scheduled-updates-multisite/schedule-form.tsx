import { Flex, FlexItem } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { useSitesPluginsQuery } from 'calypso/data/plugins/use-sites-plugins-query';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { ScheduleFormFrequency } from '../plugins-scheduled-updates/schedule-form-frequency';
import { ScheduleFormPlugins } from '../plugins-scheduled-updates/schedule-form-plugins';
import { validateSites, validatePlugins } from '../plugins-scheduled-updates/schedule-form.helper';
import { ScheduleFormSites } from './schedule-form-sites';

export const ScheduleForm = () => {
	const sites = useSiteExcerptsSorted();
	const atomicSites = sites
		.filter( ( site ) => site.is_wpcom_atomic )
		.sort( ( a, b ) => ( ( a.name || '' ) > ( b.name || '' ) ? 1 : -1 ) );
	const atomicSiteIds = sites.map( ( site ) => site.ID );

	const [ selectedSites, setSelectedSites ] = useState< number[] >( [] );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( [] );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	const {
		data: plugins = [],
		isLoading: isPluginsFetching,
		isFetched: isPluginsFetched,
	} = useSitesPluginsQuery( selectedSites.length ? selectedSites : atomicSiteIds );

	// Sites selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				sites: validateSites( selectedSites ),
			} ),
		[ selectedSites ]
	);

	// Sites selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				plugins: validatePlugins( selectedPlugins ),
			} ),
		[ selectedPlugins ]
	);

	return (
		<div className="schedule-form">
			<div className="form-control-container">
				<Flex direction={ [ 'column', 'row' ] } expanded={ true } align="start">
					<FlexItem>
						<ScheduleFormSites
							sites={ atomicSites }
							borderWrapper={ false }
							onChange={ setSelectedSites }
							onTouch={ ( touched ) => setFieldTouched( { ...fieldTouched, sites: touched } ) }
							error={ validationErrors?.sites }
							showError={ fieldTouched?.sites }
						/>
					</FlexItem>
					<FlexItem>
						<ScheduleFormPlugins
							plugins={ plugins }
							isPluginsFetching={ isPluginsFetching }
							isPluginsFetched={ isPluginsFetched }
							onChange={ setSelectedPlugins }
							onTouch={ ( touched ) => setFieldTouched( { ...fieldTouched, plugins: touched } ) }
							error={ validationErrors?.plugins }
							showError={ fieldTouched?.plugins }
							borderWrapper={ false }
						/>
					</FlexItem>
				</Flex>
			</div>
			<div className="form-control-container">
				<ScheduleFormFrequency initFrequency="daily" optionsDirection={ [ 'column', 'row' ] } />
			</div>
		</div>
	);
};
