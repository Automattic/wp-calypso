import {
	Card,
	CardBody,
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalGrid as Grid,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { arrowUp, cog } from '@wordpress/icons';
import { FunctionComponent } from 'react';

const StagingSiteManagementMoveInfo: FunctionComponent = () => {
	return (
		<Grid alignment="topLeft" columns={ 2 } gap={ 2 } style={ { maxWidth: '748px' } }>
			<Item>
				<Card>
					<CardBody>
						<VStack>
							<Text weight={ 500 }>Create new staging site</Text>
							<Text>
								Create and manage staging environments using the button in the top navigation bar.
							</Text>
							<HStack alignment="left" spacing={ 1 }>
								<Icon icon={ arrowUp } size={ 16 } style={ { fill: '#757575' } } />
								<Text variant="muted">Located in top navigation</Text>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
			</Item>
			<Item>
				<Card>
					<CardBody>
						<VStack>
							<Text weight={ 500 }>Switch environment</Text>
							<Text>
								Switch between production and staging environments using the environment switcher.
							</Text>
							<HStack alignment="left" spacing={ 1 }>
								<Icon icon={ arrowUp } size={ 16 } style={ { fill: '#757575' } } />
								<Text variant="muted">Located in top navigation</Text>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
			</Item>
			<Item>
				<Card>
					<CardBody>
						<VStack>
							<Text weight={ 500 }>Delete staging site</Text>
							<Text>Remove staging sites and manage advanced configurations in the Settings.</Text>
							<HStack alignment="left" spacing={ 1 }>
								<Icon icon={ cog } size={ 16 } style={ { fill: '#757575' } } />
								<Text variant="muted">Available in settings</Text>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
			</Item>
			<Item>
				<Card>
					<CardBody>
						<VStack>
							<Text weight={ 500 }>Try selective sync</Text>
							<Text>Sync specific files and folders, as well as well as database tables.</Text>
							<HStack alignment="left" spacing={ 1 }>
								<Icon icon={ arrowUp } size={ 16 } style={ { fill: '#757575' } } />
								<Text variant="muted">Located in top navigation</Text>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
			</Item>
		</Grid>
	);
};

export default StagingSiteManagementMoveInfo;
