import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import type { SiteActivityLog } from '@automattic/api-core';
import './activity-event.scss';
type ActivityEventProps = {
	summary: SiteActivityLog[ 'summary' ];
	content?: SiteActivityLog[ 'content' ];
	gridicon?: SiteActivityLog[ 'gridicon' ];
};

export function ActivityEvent( { summary, content, gridicon }: ActivityEventProps ) {
	return (
		<HStack spacing="2" alignment="left" className="site-activity-logs__event">
			{ gridicon && (
				<Icon
					className="site-activity-logs__event-icon"
					icon={ gridiconToWordPressIcon( gridicon ) }
					size={ 24 }
				/>
			) }
			<HStack
				spacing="1"
				justify="flex-start"
				alignment="start"
				className="site-activity-logs__event-content"
			>
				<strong>{ summary }</strong>
				{ content?.text && <span>{ content.text }</span> }
			</HStack>
		</HStack>
	);
}
