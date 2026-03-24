import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import pressableIcon from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { getPressableAddonCapacityCopyContext } from './lib/capacity-copy';

import './style.scss';

type Props = {
	productName: string;
	productSlug: string;
};

export default function PressableAddonsCustomDescription( { productName, productSlug }: Props ) {
	const translate = useTranslate();
	const { description } = useProductDescription( productSlug );
	const context = getPressableAddonCapacityCopyContext( productSlug );
	const addOnType = context?.type ?? 'unknown';

	const getCalloutCopy = () => {
		if ( ! context ) {
			return translate(
				'This add-on increases your Signature plan limits while your plan is active.'
			);
		}

		if ( addOnType === 'sites' ) {
			return translate(
				'Site limit will be increased by %(installs)s, storage by %(storage)s, and visits by %(visits)s on your Signature plan.',
				{
					args: {
						installs: context.formattedInstall,
						storage: context.formattedStorage,
						visits: context.formattedVisits,
					},
				}
			);
		}

		if ( addOnType === 'storage' ) {
			return translate( 'Storage limit will be increased by %(storage)s on your Signature plan.', {
				args: {
					storage: context.formattedStorage,
				},
			} );
		}

		if ( addOnType === 'visits' ) {
			return translate(
				'Visits limit will be increased by %(visits)s monthly visits on your Signature plan.',
				{
					args: {
						visits: context.formattedVisits,
					},
				}
			);
		}

		return translate(
			'This add-on increases your Signature plan limits while your plan is active.'
		);
	};

	const getDetailLimitCopy = () => {
		if ( ! context ) {
			return translate( "Add-ons raise your plan's limits while your plan is active." );
		}

		if ( addOnType === 'sites' ) {
			return translate(
				'This add-on increases your Signature plan by %(installs)s site, %(storage)s of storage, and %(visits)s monthly visits while your plan is active.',
				'This add-on increases your Signature plan by %(installs)s sites, %(storage)s of storage, and %(visits)s monthly visits while your plan is active.',
				{
					args: {
						installs: context.formattedInstall,
						storage: context.formattedStorage,
						visits: context.formattedVisits,
					},
					count: context.install,
				}
			);
		}

		if ( addOnType === 'storage' ) {
			return translate(
				'This add-on increases your Signature plan by %(storage)s of storage while your plan is active.',
				{
					args: {
						storage: context.formattedStorage,
					},
				}
			);
		}

		if ( addOnType === 'visits' ) {
			return translate(
				'This add-on increases your Signature plan by %(visits)s monthly visits while your plan is active.',
				{
					args: {
						visits: context.formattedVisits,
					},
				}
			);
		}

		return translate( "Add-ons raise your plan's limits while your plan is active." );
	};

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
			<div className="pressable-addons-custom-description__callout">
				<Icon icon={ info } size={ 16 } />
				<span>{ getCalloutCopy() }</span>
			</div>
			<div className="pressable-addons-custom-description__section">
				<h3 className="jetpack-product-info__section-title">{ translate( 'Details' ) }</h3>
				<ul className="pressable-addons-custom-description__details">
					<li>
						{ translate(
							'Add-ons let you customize your Pressable plan without upgrading to the next plan tier.'
						) }
					</li>
					<li>{ getDetailLimitCopy() }</li>
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
