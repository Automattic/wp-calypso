import { Flex, FlexItem } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { ScheduleFormFrequency } from '../plugins-scheduled-updates/schedule-form-frequency';
import { ScheduleFormPlugins } from '../plugins-scheduled-updates/schedule-form-plugins';
import { validateSites } from '../plugins-scheduled-updates/schedule-form.helper';
import { ScheduleFormSites } from './schedule-form-sites';

export const ScheduleForm = () => {
	const sites = useSiteExcerptsSorted();
	const atomicSites = sites.filter( ( site ) => site.is_wpcom_atomic );

	const [ selectedSites, setSelectedSites ] = useState< number[] >( [] );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	// Sites selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				sites: validateSites( selectedSites ),
			} ),
		[ selectedSites ]
	);

	return (
		<div className="schedule-form">
			<div className="form-control-container">
				<Flex direction={ [ 'column', 'row' ] } expanded={ true } align="start">
					<FlexItem>
						<ScheduleFormSites
							sites={ atomicSites }
							borderWrapper={ false }
							onTouch={ ( touched ) => setFieldTouched( { ...fieldTouched, sites: touched } ) }
							onChange={ setSelectedSites }
							error={ validationErrors?.sites }
						/>
					</FlexItem>
					<FlexItem>
						<ScheduleFormPlugins
							plugins={ [] }
							isPluginsFetching={ false }
							isPluginsFetched={ true }
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
