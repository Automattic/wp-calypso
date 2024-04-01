import { __experimentalText as Text, Button, Card, CardHeader } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Timeline from 'calypso/components/timeline';
import TimelineEvent from 'calypso/components/timeline/timeline-event';

interface Props {
	scheduleId: string;
	onNavBack?: () => void;
}
export const ScheduleLogs = ( props: Props ) => {
	const { onNavBack } = props;
	const translate = useTranslate();

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
				</div>
				<Text>{ translate( 'Saturdays at 11:00 - logs' ) }</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<Timeline>
				<TimelineEvent
					date={ new Date( '30 March 2024, 10:01 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Plugins update completed"
					icon="checkmark"
					iconBackground="warning"
				/>
				<TimelineEvent
					date={ new Date( '30 March 2024, 10:00:48 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Gravity Forms updated from 2.5.8 to 2.6.0"
					icon="checkmark"
				/>
				<TimelineEvent
					date={ new Date( '30 March 2024, 10:00:39 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Move to WordPress.com update from 5.9.3 to 6.0.0 failed [ Rolledback to 5.9.3 ]"
					icon="sync"
					iconBackground="warning"
					actionLabel="Try manual update"
					actionIsPrimary={ true }
					onActionClick={ () => {} }
				/>
				<TimelineEvent
					date={ new Date( '30 March 2024, 10:00:12 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Elementor Pro updated from 3.0.9 to 3.1.0"
					icon="checkmark"
				/>
				<TimelineEvent
					date={ new Date( '30 March 2024' ) }
					detail="Plugins update starts"
					icon="time"
					disabled
				/>
			</Timeline>
			<Timeline>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:01 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Plugins update completed successfully"
					icon="checkmark"
					iconBackground="success"
				/>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:00:48 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Gravity Forms updated from 2.5.8 to 2.6.0"
					icon="checkmark"
				/>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:00:39 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Move to WordPress.com update from 5.9.3 to 6.0.0"
					icon="checkmark"
				/>
				<TimelineEvent
					date={ new Date( '27 March 2024, 10:00:12 am' ) }
					dateFormat="HH:mm:ss a"
					detail="Elementor Pro updated from 3.0.9 to 3.1.0"
					icon="checkmark"
					iconBackground="info"
				/>
				<TimelineEvent
					date={ new Date( '27 March 2024' ) }
					detail="Plugins update starts"
					icon="time"
					disabled
				/>
			</Timeline>
		</Card>
	);
};
