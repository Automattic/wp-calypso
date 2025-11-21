import { bulkDomainsActionMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
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

	const { mutate: bulkDomainsAction, isPending } = useMutation( bulkDomainsActionMutation() );

	const saveAutoRenewSettings = () => {
		bulkDomainsAction(
			{
				type: 'set-auto-renew',
				domains: items.map( ( item ) => item.domain ),
				auto_renew: autoRenewalStatus !== 'all-disabled',
			},
			{ onSuccess }
		);
	};

	/* translators: domainCount will be the number of domains to update */
	const helperText = sprintf( __( 'Managing auto-renewal settings for %(domainCount)d domains:' ), {
		domainCount: items.length,
	} );

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
			<HStack justify="flex-end">
				<Button
					disabled={ isPending }
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
