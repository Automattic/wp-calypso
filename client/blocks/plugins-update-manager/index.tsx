import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardHeader,
	DropdownMenu,
	Tooltip,
	Modal,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, arrowLeft, info } from '@wordpress/icons';
import { useState } from 'react';
import { ScheduleForm } from './schedule-form';

import './styles.scss';

const ellipsis = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M11 18.9999L11 16.9999L13 16.9999L13 18.9999L11 18.9999ZM11 12.9999L11 10.9999L13 10.9999L13 12.9999L11 12.9999ZM11 6.99988L11 4.99988L13 4.99988L13 6.99988L11 6.99988Z"
			fill="#1E1E1E"
		/>
	</svg>
);

export const PluginsUpdateManager = () => {
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const closeConfirm = () => {
		setIsConfirmOpen( false );
	};

	return (
		<>
			{ isModalOpen && (
				<Modal title="Schedule a new update set" onRequestClose={ () => setIsModalOpen( false ) }>
					<ScheduleForm />
				</Modal>
			) }
			<ConfirmDialog isOpen={ isConfirmOpen } onConfirm={ closeConfirm } onCancel={ closeConfirm }>
				Are you sure you want to delete this schedule?
			</ConfirmDialog>
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					<Button icon={ arrowLeft }>Back</Button>
					<Text>Schedules</Text>
					<div className="placeholder"></div>
				</CardHeader>
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
										className="selected-plugins"
										text={ createInterpolateElement(
											'<div>Move to WordPress.com<br />Akismet<br />Gravity Forms</div>',
											{
												div: <div className="tooltip--selected-plugins" />,
												br: <br />,
											}
										) }
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
					<Text as="p" isBlock align="center">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						The current feature implementation only allows to set up two schedules.
					</Text>
				</CardBody>
			</Card>
		</>
	);
};
