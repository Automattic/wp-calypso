import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardHeader,
	DropdownMenu,
	Tooltip,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, arrowLeft, info, plus } from '@wordpress/icons';
import { useState } from 'react';
import { ellipsis } from './icons';

import './styles.scss';

interface Props {
	onNavBack?: () => void;
}
export const PluginsUpdateManager = ( props: Props ) => {
	const { onNavBack } = props;
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );

	const closeConfirm = () => {
		setIsConfirmOpen( false );
	};

	const toolbarPluginsText = createInterpolateElement(
		'<div>Move to WordPress.com<br />Akismet<br />Gravity Forms</div>',
		{
			div: <div className="tooltip--selected-plugins" />,
			br: <br />,
		}
	);

	return (
		<>
			<ConfirmDialog isOpen={ isConfirmOpen } onConfirm={ closeConfirm } onCancel={ closeConfirm }>
				Are you sure you want to delete this schedule?
			</ConfirmDialog>
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							Back
						</Button>
					) }
					<Text>Schedules</Text>
					<div className="placeholder"></div>
				</CardHeader>
				<CardBody>
					<div className="empty-state">
						<Text as="p" align="center">
							Set up plugin update schedules to ensure your site runs smoothly.
						</Text>
						<Button __next40pxDefaultSize icon={ plus } variant="primary">
							Create a new schedule
						</Button>
					</div>
				</CardBody>
				<CardBody>
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
												onClick: () => setIsConfirmOpen( true ),
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
												onClick: () => setIsConfirmOpen( true ),
											},
										] }
										icon={ ellipsis }
										label="More"
									/>
								</td>
							</tr>
						</tbody>
					</table>
					<Text as="p">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						The current feature implementation only allows to set up two schedules.
					</Text>
				</CardBody>
			</Card>
		</>
	);
};
