import {
	Button,
	Modal,
	IconButton,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { trash, edit } from '@wordpress/icons';
import { useState } from 'react';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { ScheduleForm } from 'calypso/my-sites/plugins/updates-manager/schedule-form';

export const UpdatesManager = () => {
	const [ isModalOpen, setIsModalOpen ] = useState( true );

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
			<Card>
				<CardHeader>Schedules</CardHeader>
				<CardBody>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Time</th>
								<th>Frequency</th>
								<th>Plugins</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Move to WordPress.com plugin</td>
								<td>12:00 AM</td>
								<td>Daily</td>
								<td>1</td>
								<td>
									<IconButton icon={ edit } label="Edit" />
									<IconButton icon={ trash } label="Remove" />
								</td>
							</tr>
							<tr>
								<td>Security plugins</td>
								<td>12:00 AM</td>
								<td>Daily</td>
								<td>3</td>
								<td>
									<IconButton icon={ edit } label="Edit" />
									<IconButton icon={ trash } label="Remove" />
								</td>
							</tr>
						</tbody>
					</table>
				</CardBody>
				<CardFooter>
					<Button variant="primary" onClick={ () => setIsModalOpen( true ) }>
						Add
					</Button>
				</CardFooter>
			</Card>
		</MainComponent>
	);
};
