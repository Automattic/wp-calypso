import { translate as i18nTranslate } from 'i18n-calypso';
import customDomain from 'calypso/assets/images/plans/wpcom/custom-domain.png';
import customize from 'calypso/assets/images/plans/wpcom/customize.png';
import launch from 'calypso/assets/images/plans/wpcom/launch-store.png';
import manageWooCommerce from 'calypso/assets/images/plans/wpcom/manage-woocommerce.png';
import promote from 'calypso/assets/images/plans/wpcom/promote.png';
import wayToPay from 'calypso/assets/images/plans/wpcom/way-to-pay.png';

type ConfirmationTasksProps = {
	translate: typeof i18nTranslate;
	hasWCPay?: boolean;
};

export interface GetActionUrlProps {
	siteName: string;
	siteSlug: string;
	wooAdminUrl: string;
	wpAdminUrl: string;
}

export const getConfirmationTasks = ( { translate, hasWCPay }: ConfirmationTasksProps ) => {
	return [
		{
			id: 'launch-store',
			illustration: launch,
			title: translate( 'Launch your store' ),
			subtitle: translate( 'Share your store with the world and start accepting orders.' ),
			getActionUrl: ( { wooAdminUrl }: GetActionUrlProps ) =>
				`${ wooAdminUrl }&path=%2Flaunch-your-store`,
		},
		{
			id: 'promote-products',
			illustration: promote,
			title: translate( 'Promote your products' ),
			subtitle: translate( 'Grow your customer base by reaching millions of engaged shoppers.' ),
			getActionUrl: ( { wooAdminUrl }: GetActionUrlProps ) => `${ wooAdminUrl }&task=marketing`,
		},
		{
			id: 'payment-methods',
			illustration: wayToPay,
			title: translate( 'Provide a way to pay ' ),
			subtitle: translate(
				'Set up one or more payment methods to make it easy for your customers to pay.'
			),
			getActionUrl: ( { wooAdminUrl }: GetActionUrlProps ) => {
				if ( hasWCPay ) {
					return `${ wooAdminUrl }&path=${ encodeURIComponent( '/payments/connect' ) }`;
				}
				return `${ wooAdminUrl }&task=payments`;
			},
		},
		{
			id: 'custom-domain',
			illustration: customDomain,
			title: translate( 'Add your custom domain' ),
			subtitle: translate(
				'Enhance your brand and make your store more professional with a custom domain.'
			),
			getActionUrl: ( { siteName, siteSlug }: GetActionUrlProps ) =>
				`/domains/add/${ siteSlug }` +
				( siteName ? `?suggestion=${ encodeURIComponent( siteName ) }` : '' ),
		},
		{
			id: 'customize-store',
			illustration: customize,
			title: translate( 'Make your store stand out' ),
			subtitle: translate( 'Keep customizing your store appearance and make it stand out.' ),
			getActionUrl: ( { wpAdminUrl }: GetActionUrlProps ) => `${ wpAdminUrl }site-editor.php`,
		},
		{
			id: 'woocommerce-app',
			illustration: manageWooCommerce,
			title: translate( 'Manage your store on the go' ),
			subtitle: translate( 'Manage your store anywhere with the free WooCommerce Mobile App.' ),
			getActionUrl: ( { wooAdminUrl }: GetActionUrlProps ) =>
				`${ wooAdminUrl }&mobileAppModal=true`,
		},
	];
};
