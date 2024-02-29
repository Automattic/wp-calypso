import StandaloneComparisonGrid from '.';
import './stories.scss';

export default { title: 'packages/components/StandaloneComparisonGrid' };

const columns = [
	{
		title: 'Import',
		rows: [
			'Import your pages and posts',
			'Import your uploaded images and files',
			'Import your users**',
			'Import your menus** and FSE templates**',
		],
		intro_copy:
			'Import your site content, without themes, customizations, or plugins. You will probably have to do some work to get things looking exactly the same.',
		action_copy: 'Import my website content',
		action: () => {},
	},
	{
		title: 'Migrate',
		rows: [
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
		intro_copy: 'Available with the Creator Plan from $NN/month',
		action_copy: 'Migrate my website',
		action: () => {},
	},
];

const GridVariations = () => (
	<>
		<StandaloneComparisonGrid columns={ columns } />
	</>
);

export const Normal = () => <GridVariations />;
