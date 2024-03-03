import { DropdownMenu, Tooltip } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { useSitePluginsQuery, type SitePlugin } from 'calypso/data/plugins/use-site-plugins-query';
import { MOMENT_TIME_FORMAT } from './config';
import { ellipsis } from './icons';

interface Props {
	siteSlug: string;
	onRemoveClick: ( id: string ) => void;
}
export const ScheduleListTable = ( props: Props ) => {
	const moment = useLocalizedMoment();
	const { siteSlug, onRemoveClick } = props;
	const { data: pluginsData } = useSitePluginsQuery( siteSlug );
	const { data: schedules = [] } = useScheduleUpdatesQuery( siteSlug );
	const plugins = pluginsData?.plugins ?? [];

	const preparePluginsTooltipInfo = ( pluginsArgs: string[] ) => {
		const pluginsList = pluginsArgs
			.map(
				( plugin: string ) =>
					plugins.find( ( { name }: SitePlugin ) => name === plugin )?.display_name
			)
			.join( '<br />' );

		return createInterpolateElement( `<div>${ pluginsList }</div>`, {
			div: <div className="tooltip--selected-plugins" />,
			br: <br />,
		} );
	};

	/**
	 * NOTE: If you update the table structure,
	 * make sure to update the ScheduleListCards component as well
	 */
	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Last Update</th>
					<th>Next Update</th>
					<th>Frequency</th>
					<th>Plugins</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ schedules.map( ( schedule ) => (
					<tr key={ schedule.id }>
						<td className="name">{ schedule.hook }</td>
						<td></td>
						<td>{ moment( schedule.timestamp * 1000 ).format( MOMENT_TIME_FORMAT ) }</td>
						<td>
							{
								{
									daily: 'Daily',
									weekly: 'Weekly',
								}[ schedule.schedule ]
							}
						</td>
						<td>
							{ schedule?.args?.length }
							{ schedule?.args && (
								<Tooltip
									text={ preparePluginsTooltipInfo( schedule.args ) as unknown as string }
									position="middle right"
									delay={ 0 }
									hideOnClick={ false }
								>
									<Icon className="icon-info" icon={ info } size={ 16 } />
								</Tooltip>
							) }
						</td>
						<td style={ { textAlign: 'end' } }>
							<DropdownMenu
								popoverProps={ { position: 'bottom left' } }
								controls={ [
									{
										title: 'Remove',
										onClick: () => onRemoveClick( schedule.id ),
									},
								] }
								icon={ ellipsis }
								label="More"
							/>
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};
