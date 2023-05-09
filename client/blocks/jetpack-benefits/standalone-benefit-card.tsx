import { TranslateResult } from 'i18n-calypso';
import * as React from 'react';

interface Props {
	title: TranslateResult;
	summary: {
		title: TranslateResult;
		stat: string;
	};
	stats: Array< {
		title: TranslateResult;
		stat: string;
	} >;
}

export const JetpackBenefitsStandaloneCard: React.FC< Props > = ( { summary, stats, title } ) => {
	const getSummary = () => {
		if ( summary ) {
			return (
				<div className="jetpack-benefits__standalone-summary">
					<span className="jetpack-benefits__stat-title">{ summary.title }</span>
					<p className="jetpack-benefits__card-stat">{ summary.stat }</p>
				</div>
			);
		}

		return null;
	};

	const getStats = () => {
		if ( stats ) {
			return (
				<ul className="jetpack-benefits__standalone-stats">
					{ stats.map( ( stat, idx ) => {
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

		return null;
	};

	return (
		<div className="jetpack-benefits__card jetpack-benefits__card--standalone card">
			<p className="jetpack-benefits__card-headline">{ title }</p>
			<div className="jetpack-benefits__card-content">
				{ getSummary() }
				{ getStats() }
			</div>
		</div>
	);
};
