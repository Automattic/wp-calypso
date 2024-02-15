import { type Callback } from '@automattic/calypso-router';
import { category, home } from '@wordpress/icons';
import Sidebar from '../../components/sidebar';

export const overviewContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = (
		<Sidebar
			path="/"
			menuItems={ [
				{
					icon: home,
					path: '/',
					link: '/overview',
					title: 'Overview',
					trackEventProps: {
						menu_item: 'A4A / Overview',
					},
					isSelected: true,
				},
				{
					icon: category,
					path: '/',
					link: '/sites',
					title: 'Sites',
					trackEventProps: {
						menu_item: 'Sites / Overview',
					},
					isSelected: false,
				},
			] }
			withUserProfileFooter
		/>
	);
	context.primary = <div>Overview</div>;

	next();
};
