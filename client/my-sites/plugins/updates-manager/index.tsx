import {
	Button,
	Modal,
	IconButton,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { trash, edit } from '@wordpress/icons';
import { useState } from 'react';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { ScheduleForm } from 'calypso/my-sites/plugins/updates-manager/schedule-form';

export const UpdatesManager = () => {
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const closeConfirm = () => {
		setIsConfirmOpen( false );
	};

	return (
		<MainComponent wideLayout>
			<NavigationHeader
				className="stats__section-header modernized-header"
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
				screenReader={ navItems.traffic?.label }
				navigationItems={ [] }
			></NavigationHeader>
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
									<IconButton icon={ edit } label="Edit" />
									<IconButton
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
									<IconButton icon={ edit } label="Edit" />
									<IconButton
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
		</MainComponent>
	);
};
