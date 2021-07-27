/**
 * External Dependencies
 */
import React from 'react';

export const JetpackBenefitsStandaloneCard = ( props ) => {
	const getSummary = () => {
		if ( props.summary ) {
			return (
				<div className="jetpack-benefits__standalone-summary">
					<span className="jetpack-benefits__stat-title">{ props.summary.title }</span>
					<p className="jetpack-benefits__card-stat">{ props.summary.stat }</p>
				</div>
			);
		}
	};

	const getStats = () => {
		if ( props.stats ) {
			return (
				<ul className="jetpack-benefits__standalone-stats">
					{ props.stats.map( ( stat, idx ) => {
						return (
							<li key={ idx }>
								<span className="jetpack-benefits__stat-title">{ stat.title }</span>
								<p className="jetpack-benefits__card-stat">{ stat.stat }</p>
							</li>
						);
					} ) }
				</ul>
			);
		}
	};

	return (
		<div className="jetpack-benefits__card jetpack-benefits__card--standalone card">
			<p className="jetpack-benefits__card-headline">{ props.title }</p>
			<div className="jetpack-benefits__card-content">
				{ getSummary() }
				{ getStats() }
			</div>
		</div>
	);
};
