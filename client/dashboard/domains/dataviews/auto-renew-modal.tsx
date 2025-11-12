import { bulkDomainsActionMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { _n, __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import type { DomainSummary } from '@automattic/api-core';

interface AutoRenewModalProps {
	items: DomainSummary[];
	onSuccess(): void;
}

export const AutoRenewModal = ( { items, onSuccess }: AutoRenewModalProps ) => {
	const [ isAutoRenewEnabled, setIsAutoRenewEnabled ] = useState( true );
	const { mutate: bulkDomainsAction, isPending } = useMutation( bulkDomainsActionMutation() );

	const saveAutoRenewSettings = () => {
		bulkDomainsAction(
			{
				type: 'set-auto-renew',
				domains: items.map( ( item ) => item.domain ),
				auto_renew: isAutoRenewEnabled,
			},
			{ onSuccess }
		);
	};

	/* translators: domainCount will be the number of domains to update */
	const label = _n(
		'Turn <strong>on</strong> auto-renew for %(domainCount)d domain',
		'Turn <strong>on</strong> auto-renew for %(domainCount)d domains',
		items.length
	);

	return (
		<VStack spacing={ 4 }>
			<ToggleControl
				disabled={ isPending }
				label={ createInterpolateElement( sprintf( label, { domainCount: items.length } ), {
					strong: <strong />,
				} ) }
				checked={ isAutoRenewEnabled }
				onChange={ setIsAutoRenewEnabled }
				__nextHasNoMarginBottom
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
