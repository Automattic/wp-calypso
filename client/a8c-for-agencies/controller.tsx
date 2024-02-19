import page, { type Callback } from '@automattic/calypso-router';
import { category, chevronLeft, home } from '@wordpress/icons';
import Sidebar from './components/sidebar';

export const redirectToOverviewContext: Callback = () => {
	page( '/overview' );
};

export const overviewContext: Callback = ( context, next ) => {
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
	context.primary = <div>Overview page</div>;

	next();
};

export const sitesContext: Callback = ( context, next ) => {
	context.secondary = (
		<Sidebar
			path="/"
			title="Sites"
			description="sample text"
			backButtonProps={ {
				label: 'Back to overview',
				icon: chevronLeft,
				onClick: () => {
					page( '/overview' );
				},
			} }
			menuItems={ [
				{
					icon: category,
					path: '/',
					link: '/sites',
					title: 'Needs attention',
					trackEventProps: {
						menu_item: 'Sites / Overview',
					},
					isSelected: false,
				},
			] }
			withSiteSelector
			withGetHelpLink
		/>
	);
	context.primary = <div>Sites page</div>;

	next();
};
