import { useBreakpoint } from '@automattic/viewport-react';
import {
	Card,
	CardBody,
	Icon,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalGrid as Grid,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowUp, cog, plus, chevronUpDown, trash, reusableBlock } from '@wordpress/icons';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { urlToSlug } from 'calypso/lib/url';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface IconConfig {
	icon: Parameters< typeof Icon >[ 0 ][ 'icon' ];
	fill: string;
	backgroundColor: string;
}

interface InfoCardItem {
	title: string;
	description: string;
	mainIcon: IconConfig;
	locationIcon: Parameters< typeof Icon >[ 0 ][ 'icon' ];
	location: string;
	link?: string;
}

const getInfoCardItems = ( settingsLink?: string ): InfoCardItem[] => [
	{
		title: __( 'Create new staging site' ),
		description: __(
			'Create and manage staging environments using the button in the top navigation bar.'
		),
		mainIcon: {
			icon: plus,
			fill: '#3858E9',
			backgroundColor: '#3858E914',
		},
		locationIcon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
	{
		title: __( 'Switch environment' ),
		description: __(
			'Switch between production and staging environments using the environment switcher.'
		),
		mainIcon: {
			icon: chevronUpDown,
			fill: '#008A20',
			backgroundColor: '#008A2014',
		},
		locationIcon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
	{
		title: __( 'Delete staging site' ),
		description: __(
			'Remove staging sites and manage advanced configurations in the staging site Settings.'
		),
		mainIcon: {
			icon: trash,
			fill: '#CC1818',
			backgroundColor: '#CC181814',
		},
		locationIcon: cog,
		location: __( 'Available in staging site settings' ),
		link: settingsLink,
	},
	{
		title: __( 'Try selective sync' ),
		description: __( 'Sync specific files and folders, as well as database tables.' ),
		mainIcon: {
			icon: reusableBlock,
			fill: '#B26200',
			backgroundColor: '#B2620014',
		},
		locationIcon: arrowUp,
		location: __( 'Located in top navigation' ),
	},
];

interface InfoCardProps {
	item: InfoCardItem;
}

const InfoCard: FunctionComponent< InfoCardProps > = ( { item } ) => {
	return (
		<Card>
			<CardBody style={ { padding: '16px' } }>
				<HStack spacing={ 4 } alignment="topLeft">
					<div
						style={ {
							width: '32px',
							height: '32px',
							minWidth: '32px',
							fill: item.mainIcon.fill,
							backgroundColor: item.mainIcon.backgroundColor,
							borderRadius: '4px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						} }
					>
						<Icon icon={ item.mainIcon.icon } size={ 20 } />
					</div>
					<VStack>
						<Text weight={ 500 } size={ 16 }>
							{ item.title }
						</Text>
						<Text>{ item.description }</Text>
						<HStack alignment="left" spacing={ 1 }>
							<Icon icon={ item.locationIcon } size={ 16 } style={ { fill: '#757575' } } />
							{ item.link ? (
								<Text variant="muted">
									<a href={ item.link } style={ { textDecoration: 'none' } }>
										{ item.location }
									</a>
								</Text>
							) : (
								<Text variant="muted">{ item.location }</Text>
							) }
						</HStack>
					</VStack>
				</HStack>
			</CardBody>
		</Card>
	);
};

const StagingSiteManagementMoveInfo: FunctionComponent = () => {
	const isMobile = useBreakpoint( '<660px' );
	const currentSite = useSelector( getSelectedSite );

	const stagingSiteId = currentSite?.options?.wpcom_staging_blog_ids?.[ 0 ];
	const stagingSite = useSelector( ( state ) => getSite( state, stagingSiteId ) );

	// Determine the target site for settings link:
	// - If current site is staging, use current site
	// - If current site is production and has staging, use staging site
	// - Otherwise, no link
	const isCurrentSiteStaging = currentSite?.is_wpcom_staging_site;
	const targetSite = isCurrentSiteStaging ? currentSite : stagingSite;

	const settingsLink = targetSite?.URL
		? `/sites/${ urlToSlug( targetSite.URL ) }/settings`
		: undefined;

	const infoCardItems = getInfoCardItems( settingsLink );

	return (
		<VStack spacing={ 10 }>
			<VStack spacing={ 2 }>
				<Heading level={ 1 } weight={ 500 } size={ 20 }>
					{ __( 'Staging site management has moved' ) }
				</Heading>
				<Text>
					{ __(
						"We've reorganized staging site controls to make them more accessible and intuitive."
					) }
					<br />
					{ __( 'Find everything you need in the new locations highlighted below.' ) }
				</Text>
			</VStack>
			<Grid
				alignment="topLeft"
				columns={ isMobile ? 1 : 2 }
				gap={ 6 }
				style={ { maxWidth: '748px' } }
			>
				{ infoCardItems.map( ( item, index ) => (
					<Item key={ index } style={ { padding: '0' } }>
						<InfoCard item={ item } />
					</Item>
				) ) }
			</Grid>
		</VStack>
	);
};

export default StagingSiteManagementMoveInfo;
