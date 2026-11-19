import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import {
	BackupDetailsLinksContext,
	renderFormattedContent,
} from '../logs-activity-formatted-block';
import type { Activity } from './types';
import type { ReactNode } from 'react';
import './activity-event.scss';
export function ActivityEvent( {
	activity,
	badge,
}: {
	activity: Activity;
	/** Shown after the event text, on the same line. */
	badge?: ReactNode;
} ) {
	const { supports } = useAppContext();
	const { activityDescription, activityIcon, activityTitle } = activity;
	const formattedContent = activityDescription.items.length ? (
		<BackupDetailsLinksContext.Provider value={ supports.backupDetailsLinks }>
			{ renderFormattedContent( { items: activityDescription.items } ) }
		</BackupDetailsLinksContext.Provider>
	) : null;

	return (
		<HStack spacing="2" alignment="topLeft" className="site-activity-logs__event">
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
				<strong className="site-activity-logs__event-title">{ activityTitle }</strong>
				{ ( formattedContent || badge ) && (
					<span>
						{ formattedContent }
						{ badge && <span className="site-activity-logs__event-badge">{ badge }</span> }
					</span>
				) }
			</HStack>
		</HStack>
	);
}
