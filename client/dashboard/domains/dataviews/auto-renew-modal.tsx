import { bulkDomainsActionMutation, userPurchasesQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { addPaymentMethodRoute, changePaymentMethodRoute } from '../../app/router/me';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import type { DomainSummary } from '@automattic/api-core';

interface AutoRenewModalProps {
	items: DomainSummary[];
	onSuccess(): void;
}

type AutoRenewalStatus = 'all-enabled' | 'all-disabled' | 'mixed';

export const AutoRenewModal = ( { items, onSuccess }: AutoRenewModalProps ) => {
	const [ autoRenewalStatus, setAutoRenewalStatus ] = useState< AutoRenewalStatus >( () => {
		if ( items.every( ( item ) => item.auto_renewing ) ) {
			return 'all-enabled';
		}

		if ( items.some( ( item ) => item.auto_renewing ) ) {
			return 'mixed';
		}

		return 'all-disabled';
	} );

	const { data: purchases, isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );

	const { mutate: bulkDomainsAction, isPending } = useMutation( bulkDomainsActionMutation() );

	// A subscription with no chargeable payment method can be flagged to auto-renew
	// but will never actually renew, so ask for a payment method first, as the
	// single-purchase toggle does.
	const domainsWithoutPaymentMethod = useMemo( () => {
		const purchasesById = new Map( ( purchases ?? [] ).map( ( p ) => [ String( p.ID ), p ] ) );
		return items.filter( ( item ) => {
			const purchase = item.subscription_id ? purchasesById.get( item.subscription_id ) : undefined;
			return !! purchase && ! purchase.is_rechargeable;
		} );
	}, [ items, purchases ] );

	const isEnabling = autoRenewalStatus !== 'all-disabled';
	const needsPaymentMethod = isEnabling && domainsWithoutPaymentMethod.length > 0;

	const saveAutoRenewSettings = () => {
		bulkDomainsAction(
			{
				type: 'set-auto-renew',
				domains: items.map( ( item ) => item.domain ),
				auto_renew: isEnabling,
			},
			{ onSuccess }
		);
	};

	/* translators: %(domainCount)s: the formatted number of domains to update */
	const helperText = sprintf( __( 'Managing auto-renewal settings for %(domainCount)s domains:' ), {
		domainCount: formatNumber( items.length ),
	} );

	const addPaymentMethodLinkProps =
		domainsWithoutPaymentMethod.length === 1
			? {
					to: changePaymentMethodRoute.fullPath,
					params: { purchaseId: domainsWithoutPaymentMethod[ 0 ].subscription_id },
				}
			: { to: addPaymentMethodRoute.fullPath };

	return (
		<VStack spacing={ 4 }>
			<div style={ { maxHeight: '200px', overflowY: 'auto' } }>
				<span>{ helperText }</span>
				<ul>
					{ items.map( ( item ) => (
						<li key={ item.domain }>{ item.domain }</li>
					) ) }
				</ul>
			</div>
			<CheckboxControl
				disabled={ isPending }
				label={ __( 'Auto-renew selected domains' ) }
				checked={ autoRenewalStatus === 'all-enabled' }
				indeterminate={ autoRenewalStatus === 'mixed' }
				onChange={ ( value ) => setAutoRenewalStatus( value ? 'all-enabled' : 'all-disabled' ) }
				__nextHasNoMarginBottom
				help={ __( 'Note: Changes may take a few minutes to appear on the dashboard' ) }
			/>
			{ needsPaymentMethod && (
				<Notice
					variant="warning"
					title={ _n(
						'This domain has no payment method on file',
						'These domains have no payment method on file',
						domainsWithoutPaymentMethod.length
					) }
					actions={
						<RouterLinkButton variant="primary" size="compact" { ...addPaymentMethodLinkProps }>
							{ __( 'Add a payment method' ) }
						</RouterLinkButton>
					}
				>
					<VStack spacing={ 2 }>
						<span>
							{ __(
								'Add a payment method so we can renew them automatically, or remove them from the selection.'
							) }
						</span>
						<ul>
							{ domainsWithoutPaymentMethod.map( ( item ) => (
								<li key={ item.domain }>{ item.domain }</li>
							) ) }
						</ul>
					</VStack>
				</Notice>
			) }
			<HStack justify="flex-end">
				<Button
					disabled={ isPending || isLoadingPurchases || needsPaymentMethod }
					isBusy={ isPending }
					__next40pxDefaultSize
					variant="primary"
					onClick={ saveAutoRenewSettings }
				>
					{ __( 'Save settings' ) }
				</Button>
			</HStack>
		</VStack>
	);
};
