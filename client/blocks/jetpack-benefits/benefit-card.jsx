/**
 * External Dependencies
 */
import React from 'react';

export const JetpackBenefitsCard = ( props ) => {
	const getStat = () => {
		if ( props.stat ) {
			return <span className="jetpack-benefits__card-stat">{ props.stat }</span>;
		}
	};

	return (
		<div className="jetpack-benefits__card card">
			<div className="jetpack-benefits__card-content">
				<p className="jetpack-benefits__card-headline">{ props.headline }</p>
				<div className="jetpack-benefits__stat-block">
					{ getStat() }
					<span>{ props.description }</span>
				</div>
			</div>
		</div>
	);
};
