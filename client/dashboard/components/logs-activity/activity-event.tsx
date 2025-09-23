import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { renderFormattedContent } from './formatted-block';
import parseActivityContent from './formatted-block-parser';
import type { SiteActivityLog } from '@automattic/api-core';
import './activity-event.scss';
type ActivityEventProps = {
	summary: SiteActivityLog[ 'summary' ];
	content?: SiteActivityLog[ 'content' ];
	gridicon?: SiteActivityLog[ 'gridicon' ];
};

export function ActivityEvent( { summary, content, gridicon }: ActivityEventProps ) {
	const parsedContent = parseActivityContent( content );
	const formattedContent = parsedContent.length
		? renderFormattedContent( { items: parsedContent } )
		: null;

	return (
		<HStack spacing="2" alignment="left" className="site-activity-logs__event">
			{ gridicon && (
				<Icon
					className="site-activity-logs__event-icon"
					icon={ gridiconToWordPressIcon( gridicon ) }
					size={ 24 }
				/>
			) }
			<div className="site-activity-logs__event-body">
				<strong>{ summary }</strong>
				{ formattedContent && (
					<div className="site-activity-logs__event-content">{ formattedContent }</div>
				) }
			</div>
		</HStack>
	);
}
