import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import pressableIcon from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';

import './style.scss';

type Props = {
	productName: string;
	productSlug: string;
};

const getAddonCount = ( productSlug: string ): number | null => {
	const parts = productSlug.split( '-' );
	const lastPart = parts[ parts.length - 1 ];
	const count = Number( lastPart );

	return Number.isFinite( count ) ? count : null;
};

export default function PressableAddonsCustomDescription( { productName, productSlug }: Props ) {
	const translate = useTranslate();
	const { description } = useProductDescription( productSlug );
	const count = getAddonCount( productSlug );

	return (
		<div className="pressable-addons-custom-description">
			<div className="jetpack-product-info__header">
				<div className="pressable-addons-custom-description__icon">
					<img alt="" src={ pressableIcon } />
				</div>
				<div className="jetpack-product-info__header-title">
					<h2>{ productName }</h2>
				</div>
			</div>
			{ description && <div className="jetpack-product-info__description">{ description }</div> }
			{ count !== null && (
				<div className="pressable-addons-custom-description__callout">
					<Icon icon={ info } size={ 16 } />
					<span>
						{ translate( 'Site limit will be increased by %(count)d on your Signature plan', {
							args: { count },
						} ) }
					</span>
				</div>
			) }
			<div className="pressable-addons-custom-description__section">
				<h3 className="jetpack-product-info__section-title">{ translate( 'Details' ) }</h3>
				<ul className="pressable-addons-custom-description__details">
					<li>
						{ translate(
							'Add-ons let you customize your Pressable plan without upgrading to the next plan tier.'
						) }
					</li>
					<li>
						{ translate( "Site add-ons raise your plan's limits while your plan is active." ) }
					</li>
					<li>
						{ translate(
							'Add-ons must be attached to an active Pressable plan. If you cancel your Pressable plan, any add-ons will be canceled automatically.'
						) }
					</li>
					<li>
						{ translate(
							'If you upgrade your Pressable plan, your existing add-ons will carry over and be linked to the new plan.'
						) }
					</li>
					<li>
						{ translate(
							'Add-ons follow the same refund policy as your plan: 7 days for monthly subscriptions and 14 days for yearly subscriptions.'
						) }
					</li>
					<li>
						{ translate(
							'At checkout, you can choose monthly or yearly billing for each add-on.'
						) }
					</li>
					<li>
						{ translate(
							"While add-ons are attached to a Pressable plan, they're currently invoiced separately from your plan invoice."
						) }
					</li>
				</ul>
			</div>
		</div>
	);
}
