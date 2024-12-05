import { migrationPlanFeatures } from './migration-plan-features';
import type { PlanSlug } from '@automattic/calypso-products';

export const MigrationPlanFeatureList = ( { planSlug }: { planSlug: PlanSlug } ) => {
	return (
		<ul className="import__details-list">
			{ migrationPlanFeatures[ planSlug ].map( ( feature: string ) => (
				<li className="import__upgrade-plan-feature" key={ feature }>
					{ feature }
				</li>
			) ) }
		</ul>
	);
};
