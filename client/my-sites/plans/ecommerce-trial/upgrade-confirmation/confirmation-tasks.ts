import { translate as i18nTranslate } from 'i18n-calypso';

type ConfirmationTasksProps = {
	translate: typeof i18nTranslate;
};

export const getConfirmationTasks = ( { translate }: ConfirmationTasksProps ) => {
	return [
		{
			illustration: 'TODO',
			title: translate( 'Select your custom domain' ),
			subtitle: translate(
				'Enhance your brand and make your store more professional with a custom domain.'
			),
		},
		{
			illustration: 'TODO',
			title: translate( 'Promote your products' ),
			subtitle: translate( 'Grow your customer base by reaching millions of engaged shoppers.' ),
		},
		{
			illustration: 'TODO',
			title: translate( 'Provide a way to pay ' ),
			subtitle: translate(
				'Set up one or more payment methods to make it easy for your customers to pay.'
			),
		},
		{
			illustration: 'TODO',
			title: translate( 'Create a marketing campaign' ),
			subtitle: translate( 'Drive sales and build loyalty through automated marketing messages.' ),
		},
		{
			illustration: 'TODO',
			title: translate( 'Make your store stand out' ),
			subtitle: translate( 'Keep customizing your store appearance and make it stand out.' ),
		},
		{
			illustration: 'TODO',
			title: translate( 'Manage your store on the go' ),
			subtitle: translate( 'Manage your store anywhere with the free WooCommerce Mobile App.' ),
		},
	];
};
