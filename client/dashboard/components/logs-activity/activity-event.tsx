import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { renderFormattedContent } from '../logs-activity-formatted-block';
import type { Activity } from './types';
import './activity-event.scss';
export function ActivityEvent( { activity }: { activity: Activity } ) {
	const { activityDescription, activityIcon, activityTitle } = activity;
	const formattedContent = activityDescription.items.length
		? renderFormattedContent( { items: activityDescription.items } )
		: null;

	return (
		<HStack spacing="2" alignment="left" className="site-activity-logs__event">
			{ activityIcon && (
				<Icon
					className="site-activity-logs__event-icon"
					icon={ gridiconToWordPressIcon( activityIcon ) }
					size={ 24 }
				/>
			) }
			<HStack
				spacing="1"
				justify="flex-start"
				alignment="start"
				className="site-activity-logs__event-content"
			>
				<strong>{ activityTitle }</strong>
				{ formattedContent && <span>{ formattedContent }</span> }
			</HStack>
		</HStack>
	);
}
