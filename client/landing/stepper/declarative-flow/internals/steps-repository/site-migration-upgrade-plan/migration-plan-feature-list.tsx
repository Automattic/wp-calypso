import { JetpackLogo } from '@automattic/components';
import { migrationPlanFeatures } from './migration-plan-features';
import type { PlanSlug } from '@automattic/calypso-products';
export const MigrationPlanFeatureList = ( { planSlug }: { planSlug: PlanSlug } ) => {
	return (
		<ul className="import__details-list">
			{ migrationPlanFeatures[ 'wpcomFeatures' ][ planSlug ]?.map( ( feature: string ) => (
				<li className="import__upgrade-plan-feature" key={ feature }>
					{ feature }
				</li>
			) ) }
			<li className="import__upgrade-plan-feature logo">
				<JetpackLogo size={ 16 } />
			</li>
			{ migrationPlanFeatures[ 'jetpackFeatures' ].map( ( feature: string ) => (
				<li className="import__upgrade-plan-feature" key={ feature }>
					{ feature }
				</li>
			) ) }
		</ul>
	);
};
