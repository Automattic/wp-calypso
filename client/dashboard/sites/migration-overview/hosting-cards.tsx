import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';

const GRID_CARDS = [
	{
		title: __( 'Seriously secure' ),
		description: __(
			'Firewalls, encryption, brute force, and DDoS protection. Your security’s all taken care of so you can stay one step ahead of any threats.'
		),
	},
	{
		title: __( 'Unmetered bandwidth' ),
		description: __(
			'With 99.999%% uptime and entirely unmetered bandwidth and traffic on every plan, you’ll never need to worry about being too successful.'
		),
	},
	{
		title: __( 'Power, meet performance' ),
		description: __(
			'Our custom 28+ location CDN and 99.999%% uptime ensure your site is always fast and always available from anywhere in the world.'
		),
	},
	{
		title: __( 'Plugins, themes, and custom code' ),
		description: __(
			'Build anything with full support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.'
		),
	},
	{
		title: __( 'Expert support' ),
		description: __(
			'Whenever you’re stuck, whatever you’re trying to make happen – our Happiness Engineers have the answers.'
		),
	},
];

export function HostingCards() {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const layout = { columns: 3, rows: 2, gap: 4 };

	if ( isSmallViewport ) {
		layout.columns = 1;
		layout.rows = GRID_CARDS.length;
		layout.gap = 4;
	}

	return (
		<Grid { ...layout }>
			{ GRID_CARDS.map( ( card ) => (
				<Card key={ card.title }>
					<CardBody>
						<VStack spacing={ 2 }>
							<Text as="p" size="15px" weight={ 500 } lineHeight="20px">
								{ card.title }
							</Text>
							<Text as="p" variant="muted">
								{ card.description }
							</Text>
						</VStack>
					</CardBody>
				</Card>
			) ) }
		</Grid>
	);
}
