import { translate as i18nTranslate } from 'i18n-calypso';
import customDomain from 'calypso/assets/images/plans/wpcom/custom-domain.png';
import customize from 'calypso/assets/images/plans/wpcom/customize.png';
import manageWooCommerce from 'calypso/assets/images/plans/wpcom/manage-woocommerce.png';
import marketing from 'calypso/assets/images/plans/wpcom/marketing.png';
import promote from 'calypso/assets/images/plans/wpcom/promote.png';
import wayToPay from 'calypso/assets/images/plans/wpcom/way-to-pay.png';

type ConfirmationTasksProps = {
	translate: typeof i18nTranslate;
};

export const getConfirmationTasks = ( { translate }: ConfirmationTasksProps ) => {
	return [
		{
			illustration: customDomain,
			title: translate( 'Select your custom domain' ),
			subtitle: translate(
				'Enhance your brand and make your store more professional with a custom domain.'
			),
		},
		{
			illustration: promote,
			title: translate( 'Promote your products' ),
			subtitle: translate( 'Grow your customer base by reaching millions of engaged shoppers.' ),
		},
		{
			illustration: wayToPay,
			title: translate( 'Provide a way to pay ' ),
			subtitle: translate(
				'Set up one or more payment methods to make it easy for your customers to pay.'
			),
		},
		{
			illustration: marketing,
			title: translate( 'Create a marketing campaign' ),
			subtitle: translate( 'Drive sales and build loyalty through automated marketing messages.' ),
		},
		{
			illustration: customize,
			title: translate( 'Make your store stand out' ),
			subtitle: translate( 'Keep customizing your store appearance and make it stand out.' ),
		},
		{
			illustration: manageWooCommerce,
			title: translate( 'Manage your store on the go' ),
			subtitle: translate( 'Manage your store anywhere with the free WooCommerce Mobile App.' ),
		},
	];
};
