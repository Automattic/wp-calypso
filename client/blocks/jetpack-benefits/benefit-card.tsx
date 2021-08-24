/**
 * External Dependencies
 */
import React from 'react';
import { TranslateResult } from 'i18n-calypso';

interface Props {
	stat?: TranslateResult | string | number | null;
	headline: TranslateResult;
	description: TranslateResult;
	placeholder?: boolean | null;
	jestMarker?: string;
}

export const JetpackBenefitsCard: React.FC< Props > = ( {
	stat,
	headline,
	description,
	placeholder,
} ) => {
	const getStat = () => {
		if ( stat ) {
			return <span className="jetpack-benefits__card-stat">{ stat }</span>;
		}
	};

	return (
		<div className="jetpack-benefits__card card">
			<div className="jetpack-benefits__card-content">
				<p className="jetpack-benefits__card-headline">{ headline }</p>
				<div
					className={
						'jetpack-benefits__stat-block ' +
						( placeholder ? 'jetpack-benefits__stat-block--placeholder' : '' )
					}
				>
					{ getStat() }
					<div className="jetpack-benefits__card-description">{ description }</div>
				</div>
			</div>
		</div>
	);
};
