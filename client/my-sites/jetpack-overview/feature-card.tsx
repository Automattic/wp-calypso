import { Gridicon } from '@automattic/components';
import { isFeatureActive } from './feature-data';
import type { FeatureGroup, PlanKey } from './feature-data';

interface FeatureCardProps {
	group: FeatureGroup;
	planKey: PlanKey;
	hasWooCommerce?: boolean;
	siteSlug?: string;
}

type StatusClass = 'is-full' | 'is-partial' | 'is-none';

export default function FeatureCard( {
	group,
	planKey,
	hasWooCommerce = false,
	siteSlug = '',
}: FeatureCardProps ) {
	const features = group.features.filter( ( f ) => ! f.requiresWooCommerce || hasWooCommerce );
	const activeFeatures = features.filter( ( f ) => isFeatureActive( f, planKey ) );
	const lockedFeatures = features.filter( ( f ) => ! isFeatureActive( f, planKey ) );

	let statusClass: StatusClass = 'is-partial';
	let statusLabel: string;

	if ( activeFeatures.length === features.length ) {
		statusClass = 'is-full';
		statusLabel = 'All features active';
	} else if ( activeFeatures.length === 0 ) {
		statusClass = 'is-none';
		statusLabel = 'No features active';
	} else {
		statusLabel = `${ activeFeatures.length } of ${ features.length } features active`;
	}

	return (
		<div className="jetpack-feature-card">
			<div className="jetpack-feature-card__header">
				<div className="jetpack-feature-card__icon">
					{ group.gridicon ? (
						<Gridicon icon={ group.gridicon } size={ 24 } />
					) : (
						<img src={ group.iconSrc } alt="" width={ 28 } height={ 28 } />
					) }
				</div>
				<div className="jetpack-feature-card__meta">
					<div className="jetpack-feature-card__title">
						<span
							className={ `jetpack-feature-card__status-dot ${ statusClass }` }
							aria-hidden="true"
						/>
						{ group.name }
					</div>
					<div className="jetpack-feature-card__count">{ statusLabel }</div>
				</div>
			</div>

			<ul className="jetpack-feature-card__list" aria-label={ `${ group.name } features` }>
				{ activeFeatures.map( ( feature ) => (
					<li
						key={ feature.id }
						className="jetpack-feature-card__item jetpack-feature-card__item--active"
					>
						<Gridicon icon="checkmark" size={ 16 } />
						<span className="jetpack-feature-card__item-label">
							{ feature.path ? (
								<a
									href={ feature.path.replace( ':site', siteSlug ) }
									className="jetpack-feature-card__item-link"
								>
									{ feature.name }
								</a>
							) : (
								feature.name
							) }
							{ feature.description.length <= 20 && (
								<span className="jetpack-feature-card__item-note">{ feature.description }</span>
							) }
						</span>
					</li>
				) ) }

				{ lockedFeatures.length > 0 && activeFeatures.length > 0 && (
					<li className="jetpack-feature-card__separator" aria-hidden="true" />
				) }

				{ lockedFeatures.map( ( feature ) => (
					<li
						key={ feature.id }
						className="jetpack-feature-card__item jetpack-feature-card__item--locked"
					>
						<Gridicon icon="lock" size={ 16 } />
						<span className="jetpack-feature-card__item-label">
							{ feature.path ? (
								<a
									href={ feature.path.replace( ':site', siteSlug ) }
									className="jetpack-feature-card__item-link"
								>
									{ feature.name }
								</a>
							) : (
								feature.name
							) }
							{ feature.description.length <= 20 && (
								<span className="jetpack-feature-card__item-note">{ feature.description }</span>
							) }
						</span>
					</li>
				) ) }
			</ul>
		</div>
	);
}
