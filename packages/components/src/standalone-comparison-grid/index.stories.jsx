import { Button } from '@wordpress/components';
import { StandAloneComparisonGrid, Column } from '.';
import './stories.scss';

export default { title: 'packages/components/StandaloneComparisonGrid' };

const columns = [
	{
		title: 'Import',
		features: [
			'Import your pages and posts',
			'Import your uploaded images and files',
			'Import your users**',
			'Import your menus** and FSE templates**',
		],
		introCopy:
			'Import your site content, without themes, customizations, or plugins. You will probably have to do some work to get things looking exactly the same.',
		controls: (
			<Button variant="primary" onClick={ () => {} }>
				Import my website content
			</Button>
		),
	},
	{
		title: 'Migrate',
		features: [
			'Import your pages and posts',
			'Import your uploaded images and files',
			'Import your users',
			'Import your menus and FSE templates',
			'Import your theme and exact layout',
			'Import your plugins and existing setup',
			'Custom blocks from all plugins keep working',
			'Import custom files and PHP code',
			'Import content from page builders like Elementor, Divi, or WP Bakery',
			'Import all WooCommerce products and orders',
		],
		introCopy: 'Available with the Creator Plan from $NN/month',
		controls: (
			<Button variant="primary" onClick={ () => {} }>
				Migrate my website
			</Button>
		),
		action: () => {},
	},
];

const GridVariations = () => (
	<StandAloneComparisonGrid>
		<Column { ...columns[ 0 ] } />
		<Column { ...columns[ 1 ] } />
	</StandAloneComparisonGrid>
);

export const Normal = () => <GridVariations />;
