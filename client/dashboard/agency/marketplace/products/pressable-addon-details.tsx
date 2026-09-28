import {
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Notice } from '../../../components/notice';
import { getPressableAddonCopy } from './lib/pressable-addon-copy';
import type { AgencyProduct } from '@automattic/api-core';

export default function PressableAddonDetails( { product }: { product: AgencyProduct } ) {
	const { callout, limit } = getPressableAddonCopy( product );
	const details = [
		__( 'Add-ons let you customize your Pressable plan without upgrading to the next plan tier.' ),
		limit,
		__(
			'Add-ons must be attached to an active Pressable plan. If you cancel your Pressable plan, any add-ons will be canceled automatically.'
		),
		__(
			'If you upgrade your Pressable plan, your existing add-ons will carry over and be linked to the new plan.'
		),
		__(
			'Add-ons follow the same refund policy as your plan: 7 days for monthly subscriptions and 14 days for yearly subscriptions.'
		),
		__( 'At checkout, you can choose monthly or yearly billing for each add-on.' ),
		__(
			"While add-ons are attached to a Pressable plan, they're currently invoiced separately from your plan invoice."
		),
	];

	return (
		<>
			<Notice>{ callout }</Notice>
			<VStack spacing={ 2 }>
				<Text weight={ 500 }>{ __( 'Details' ) }</Text>
				<ul className="dashboard-marketplace-products__list">
					{ details.map( ( detail ) => (
						<li key={ detail }>
							<Icon icon={ check } size={ 20 } />
							<Text variant="muted">{ detail }</Text>
						</li>
					) ) }
				</ul>
			</VStack>
		</>
	);
}
