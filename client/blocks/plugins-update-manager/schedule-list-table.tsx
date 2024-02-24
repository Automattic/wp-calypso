import { DropdownMenu, Tooltip } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import { ellipsis } from './icons';

interface Props {
	onRemoveClick: () => void;
}
export const ScheduleListTable = ( props: Props ) => {
	const { onRemoveClick } = props;
	const toolbarPluginsText = createInterpolateElement(
		'<div>Move to WordPress.com<br />Akismet<br />Gravity Forms</div>',
		{
			div: <div className="tooltip--selected-plugins" />,
			br: <br />,
		}
	);

	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Next Update</th>
					<th>Frequency</th>
					<th>Plugins</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td className="name">Move to WordPress.com plugin</td>
					<td>Feb 28 2023 7:00 PM UTC</td>
					<td>Daily</td>
					<td>
						1
						<Tooltip
							text="Move to WordPress.com plugin"
							position="middle right"
							delay={ 0 }
							hideOnClick={ false }
						>
							<Icon className="icon-info" icon={ info } size={ 16 } />
						</Tooltip>
					</td>
					<td style={ { textAlign: 'end' } }>
						<DropdownMenu
							popoverProps={ { position: 'bottom left' } }
							controls={ [
								{
									title: 'Remove',
									onClick: onRemoveClick,
								},
							] }
							icon={ ellipsis }
							label="More"
						/>
					</td>
				</tr>
				<tr>
					<td className="name">Security plugins</td>
					<td>Feb 28 2023 7:00 PM UTC</td>
					<td>Daily</td>
					<td>
						3
						<Tooltip
							text={ toolbarPluginsText as unknown as string }
							position="middle right"
							delay={ 0 }
							hideOnClick={ false }
						>
							<Icon className="icon-info" icon={ info } size={ 16 } />
						</Tooltip>
					</td>
					<td style={ { textAlign: 'end' } }>
						<DropdownMenu
							popoverProps={ { position: 'bottom left' } }
							controls={ [
								{
									title: 'Remove',
									onClick: onRemoveClick,
								},
							] }
							icon={ ellipsis }
							label="More"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	);
};
