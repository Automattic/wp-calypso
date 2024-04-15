import { Flex, FlexItem } from '@wordpress/components';
import { ScheduleFormFrequency } from '../plugins-scheduled-updates/schedule-form-frequency';
import { ScheduleFormPlugins } from '../plugins-scheduled-updates/schedule-form-plugins';

export const ScheduleForm = () => {
	return (
		<div className="schedule-form">
			<div className="form-control-container">
				<Flex direction={ [ 'column', 'row' ] } expanded={ true } align="start">
					<FlexItem>Site selection</FlexItem>
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
