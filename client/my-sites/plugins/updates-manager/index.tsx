import { Button, IconButton, Card, CardHeader, CardBody, CardFooter } from '@wordpress/components';
import { trash, edit } from '@wordpress/icons';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';

export const UpdatesManager = () => {
	return (
		<MainComponent wideLayout>
			<NavigationHeader
				className="stats__section-header modernized-header"
				title="Plugin updates manager"
				subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
				screenReader={ navItems.traffic?.label }
				navigationItems={ [] }
			></NavigationHeader>
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
					<Button variant="primary">Add</Button>
				</CardFooter>
			</Card>
		</MainComponent>
	);
};
