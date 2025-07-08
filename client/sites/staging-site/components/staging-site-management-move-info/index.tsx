import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalGrid as Grid,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, arrowUp, cog } from '@wordpress/icons';
import { FunctionComponent } from 'react';

interface InfoCardItem {
	title: string;
	description: string;
	icon: Parameters< typeof Icon >[ 0 ][ 'icon' ];
	location: string;
}

const infoCardItems: InfoCardItem[] = [
	{
		title: __( 'Create new staging site' ),
		description: __(
			'Create and manage staging environments using the button in the top navigation bar.'
		),
		icon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
	{
		title: __( 'Switch environment' ),
		description: __(
			'Switch between production and staging environments using the environment switcher.'
		),
		icon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
	{
		title: __( 'Delete staging site' ),
		description: __( 'Remove staging sites and manage advanced configurations in the Settings.' ),
		icon: cog,
		location: __( 'Available in settings' ),
	},
	{
		title: __( 'Try selective sync' ),
		description: __( 'Sync specific files and folders, as well as database tables.' ),
		icon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
];

interface InfoCardProps {
	item: InfoCardItem;
}

const InfoCard: FunctionComponent< InfoCardProps > = ( { item } ) => {
	return (
		<Card>
			<CardBody>
				<VStack>
					<Text weight={ 500 }>{ item.title }</Text>
					<Text>{ item.description }</Text>
					<HStack alignment="left" spacing={ 1 }>
						<Icon icon={ item.icon } size={ 16 } style={ { fill: '#757575' } } />
						<Text variant="muted">{ item.location }</Text>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
};

const StagingSiteManagementMoveInfo: FunctionComponent = () => {
	return (
		<Grid alignment="topLeft" columns={ 2 } gap={ 2 } style={ { maxWidth: '748px' } }>
			{ infoCardItems.map( ( item, index ) => (
				<Item key={ index }>
					<InfoCard item={ item } />
				</Item>
			) ) }
		</Grid>
	);
};

export default StagingSiteManagementMoveInfo;
