import { __ } from '@wordpress/i18n';

export default function Hero() {
	return (
		<div>
			<div className="benchmarks-empty-state__heading">
				{ __( 'See how you stack up against agency peers' ) }
			</div>
			<div className="benchmarks-empty-state__description">
				{ __(
					"Submit your quarterly KPIs and get anonymous peer comparisons across margin, retention, AI maturity, and more, so you can see where you're ahead and where to focus."
				) }
			</div>
		</div>
	);
}
