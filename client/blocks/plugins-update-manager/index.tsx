import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Modal,
} from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';
import { useState } from 'react';
import { ScheduleForm } from './schedule-form';

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
			<Card>
				<CardHeader>Schedules</CardHeader>
				<CardBody>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Time</th>
								<th style={ { textAlign: 'center' } }>Frequency</th>
								<th style={ { textAlign: 'center' } }>Plugins</th>
								<th style={ { textAlign: 'end' } }>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Move to WordPress.com plugin</td>
								<td>Feb 28 2023 7:00 PM UTC</td>
								<td style={ { textAlign: 'center' } }>Daily</td>
								<td style={ { textAlign: 'center' } }>1</td>
								<td style={ { textAlign: 'end' } }>
									<Button icon={ edit } label="Edit" />
									<Button
										icon={ trash }
										label="Remove"
										onClick={ () => {
											setIsConfirmOpen( true );
										} }
									/>
								</td>
							</tr>
							<tr>
								<td>Security plugins</td>
								<td>Feb 28 2023 7:00 PM UTC</td>
								<td style={ { textAlign: 'center' } }>Daily</td>
								<td style={ { textAlign: 'center' } }>3</td>
								<td style={ { textAlign: 'end' } }>
									<Button icon={ edit } label="Edit" />
									<Button
										icon={ trash }
										label="Remove"
										onClick={ () => {
											setIsConfirmOpen( true );
										} }
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</CardBody>
				<CardFooter>
					<Button variant="primary" onClick={ () => setIsModalOpen( true ) }>
						Create a new schedule
					</Button>
				</CardFooter>
			</Card>
		</>
	);
};
