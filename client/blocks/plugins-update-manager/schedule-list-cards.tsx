import { DropdownMenu, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { Badge } from 'calypso/blocks/plugins-update-manager/badge';
import { ellipsis } from 'calypso/blocks/plugins-update-manager/icons';

interface Props {
	onRemoveClick: () => void;
}
export const ScheduleListCards = ( props: Props ) => {
	const { onRemoveClick } = props;

	return (
		<div className="schedule-list--cards">
			<div className="schedule-list--card">
				<DropdownMenu
					className="schedule-list--card-actions"
					controls={ [
						{
							title: 'Remove',
							onClick: onRemoveClick,
						},
					] }
					icon={ ellipsis }
					label="More"
				/>

				<div className="schedule-list--card-label">
					<label htmlFor="name">Name</label>
					<strong id="name">Move to WordPress.com plugin</strong>
				</div>

				<div className="schedule-list--card-label">
					<label htmlFor="last-update">Last Update</label>
					<span id="last-update">
						Feb 28 7:00 PM UTC
						<Badge type="success" />
					</span>
				</div>

				<div className="schedule-list--card-label">
					<label htmlFor="next-update">Next update</label>
					<span id="next-update">Feb 28 7:00 PM UTC</span>
				</div>

				<div className="schedule-list--card-label">
					<label htmlFor="frequency">Frequency</label>
					<span id="frequency">Daily</span>
				</div>

				<div className="schedule-list--card-label">
					<label htmlFor="plugins">Plugins</label>
					<span id="plugins">
						1
						<Tooltip
							text="Move to WordPress.com plugin"
							position="middle right"
							delay={ 0 }
							hideOnClick={ false }
						>
							<Icon className="icon-info" icon={ info } size={ 16 } />
						</Tooltip>
					</span>
				</div>
			</div>
		</div>
	);
};
