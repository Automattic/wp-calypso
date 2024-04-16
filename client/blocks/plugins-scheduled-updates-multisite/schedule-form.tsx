import { Flex, FlexItem } from '@wordpress/components';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { ScheduleFormFrequency } from '../plugins-scheduled-updates/schedule-form-frequency';
import { ScheduleFormPlugins } from '../plugins-scheduled-updates/schedule-form-plugins';
import { ScheduleFormSites } from './schedule-form-sites';

export const ScheduleForm = () => {
	const sites = useSiteExcerptsSorted();
	const atomicSites = sites.filter( ( site ) => site.is_wpcom_atomic );

	return (
		<div className="schedule-form">
			<div className="form-control-container">
				<Flex direction={ [ 'column', 'row' ] } expanded={ true } align="start">
					<FlexItem>
						<ScheduleFormSites sites={ atomicSites } />
					</FlexItem>
					<FlexItem>
						<ScheduleFormPlugins
							plugins={ [] }
							isPluginsFetching={ false }
							isPluginsFetched={ true }
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
