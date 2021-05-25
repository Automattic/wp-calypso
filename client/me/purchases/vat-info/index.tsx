/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';

export default function VatInfoPage(): JSX.Element {
	const translate = useTranslate();
	const { countryCode, vatId } = useVatInfo();

	return (
		<div className="vat-info">
			<SectionHeader label={ translate( 'VAT Information' ) } />

			<CompactCard>
				<div>
					<label>{ translate( 'Country' ) }</label>
					<input value={ countryCode } />
				</div>
				<div>
					<label>{ translate( 'VAT' ) }</label>
					<input value={ vatId } />
				</div>
			</CompactCard>
		</div>
	);
}

interface VatDetails {
	countryCode: string;
	vatId: string;
}

function useVatInfo(): VatDetails {
	return {
		countryCode: 'UK',
		vatId: '12345',
	};
}
