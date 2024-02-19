import page, { type Callback } from '@automattic/calypso-router';
import { category, chevronLeft } from '@wordpress/icons';
import Sidebar from '../../components/sidebar';

export const sitesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
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
	context.primary = <div>sites</div>;

	next();
};

export const sitesFavoriteContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>sites favorite</div>;

	next();
};
