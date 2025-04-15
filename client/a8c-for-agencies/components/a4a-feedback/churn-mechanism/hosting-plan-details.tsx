import { Button } from '@wordpress/components';
import { Icon, close, arrowUpLeft } from '@wordpress/icons';
import { numberFormatCompact, useTranslate } from 'i18n-calypso';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useGetPressablePlanByProductId from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-get-pressable-plan-by-product-id';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';

const WPCOMHostingPlanDetails = () => {
	const translate = useTranslate();

	return (
		<SimpleList
			icon={
				<Icon className="a4a-feedback__pressable-plan-details-icon" icon={ close } size={ 16 } />
			}
			items={ [
				translate( '50GB of storage' ),
				translate( 'Free staging site' ),
				translate( 'Unrestricted bandwidth' ),
			] }
		/>
	);
};

const PressablePlanDetails = ( { productId }: { productId: number } ) => {
	const translate = useTranslate();

	const pressablePlan = useGetPressablePlanByProductId( { product_id: productId } );
	const selectedPlanInfo = pressablePlan ? getPressablePlan( pressablePlan.slug ) : null;

	const isCustomPlan = ! pressablePlan;

	return (
		<SimpleList
			icon={
				<Icon className="a4a-feedback__pressable-plan-details-icon" icon={ close } size={ 16 } />
			}
			items={
				isCustomPlan
					? [
							translate( 'Custom WordPress installs' ),
							translate( 'Custom visits per month' ),
							translate( 'Custom storage per month' ),
							translate( 'Unmetered bandwidth' ),
					  ]
					: [
							translate( '%(count)d WordPress install', '%(count)d WordPress installs', {
								args: {
									count: selectedPlanInfo?.install ?? 0,
								},
								count: selectedPlanInfo?.install ?? 0,
								comment: '%(count)d is the number of WordPress installs.',
							} ),
							translate( '%(count)d staging site', '%(count)d staging sites', {
								args: {
									count: selectedPlanInfo?.install ?? 0,
								},
								count: selectedPlanInfo?.install ?? 0,
								comment: '%(count)d is the number of staging sites.',
							} ),
							translate( '%(count)s visits per month', {
								args: {
									count: numberFormatCompact( selectedPlanInfo?.visits ?? 0 ),
								},
								comment: '%(count)d is the number of visits.',
							} ),
							translate( '%(storageSize)dGB of storage', {
								args: {
									storageSize: selectedPlanInfo?.storage ?? 0,
								},
								comment: '%(storageSize)d is the size of storage in GB.',
							} ),
							translate( 'Unmetered bandwidth' ),
					  ]
			}
		/>
	);
};

const HostingPlanDetails = ( {
	productId,
	isPressableLicense,
	isWPCOMHostingLicense,
}: {
	productId?: number;
	isPressableLicense: boolean;
	isWPCOMHostingLicense: boolean;
} ) => {
	const translate = useTranslate();

	return (
		<div className="a4a-feedback__pressable-plan-details">
			<div className="a4a-feedback__pressable-plan-details-label">
				{ translate( "When you cancel you'll immediately lose access to" ) }
			</div>
			{ isPressableLicense && productId && <PressablePlanDetails productId={ productId } /> }
			{ isWPCOMHostingLicense && <WPCOMHostingPlanDetails /> }
			<Button
				className="a4a-feedback__pressable-plan-details-button"
				icon={ arrowUpLeft }
				iconSize={ 16 }
				iconPosition="right"
				variant="link"
				target="_blank"
				href={
					isPressableLicense
						? A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK
						: A4A_MARKETPLACE_HOSTING_WPCOM_LINK
				}
			>
				{ translate( 'And more' ) }
			</Button>
		</div>
	);
};

export default HostingPlanDetails;
