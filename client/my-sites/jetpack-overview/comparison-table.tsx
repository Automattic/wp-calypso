import { Button, Gridicon } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FEATURE_GROUPS, PLAN_DISPLAY_NAMES, PLAN_KEY_ORDER } from './feature-data';
import type { FeatureAvailability, PlanKey } from './feature-data';

interface ComparisonTableProps {
	currentPlanKey: PlanKey;
	onUpgradeClick: ( planKey: PlanKey ) => void;
	hasWooCommerce?: boolean;
	siteSlug: string;
}

const UPGRADE_PLANS: PlanKey[] = [ 'personal', 'premium', 'business' ];
const TABLE_PLAN_KEYS: PlanKey[] = PLAN_KEY_ORDER.filter( ( k ) => k !== 'commerce' );

const AVAILABILITY_LABELS: Record< FeatureAvailability, { symbol: string; label: string } > = {
	full: { symbol: '✓', label: 'Included' },
	limited: { symbol: '~', label: 'Limited' },
	addon: { symbol: '+', label: 'Add-on' },
	none: { symbol: '—', label: 'Not included' },
};

function UpgradeRow( {
	currentPlanKey,
	onUpgradeClick,
	translate,
}: {
	currentPlanKey: PlanKey;
	onUpgradeClick: ( planKey: PlanKey ) => void;
	translate: ReturnType< typeof useTranslate >;
} ) {
	const currentTierIndex = TABLE_PLAN_KEYS.indexOf( currentPlanKey );
	return (
		<tr className="jetpack-comparison-table__upgrade-row">
			<td className="jetpack-comparison-table__feature-col" />
			{ TABLE_PLAN_KEYS.map( ( key ) => {
				const planTierIndex = TABLE_PLAN_KEYS.indexOf( key );
				const isUpgradeable = UPGRADE_PLANS.includes( key ) && planTierIndex > currentTierIndex;
				const isCurrent = key === currentPlanKey;
				return (
					<td
						key={ key }
						className={ clsx( 'jetpack-comparison-table__plan-col', {
							'is-current': isCurrent,
						} ) }
					>
						{ isUpgradeable && (
							<Button
								compact
								primary
								className="jetpack-comparison-table__upgrade-btn"
								onClick={ () => onUpgradeClick( key ) }
							>
								{ translate( 'Upgrade' ) }
							</Button>
						) }
					</td>
				);
			} ) }
		</tr>
	);
}

export default function ComparisonTable( {
	currentPlanKey,
	onUpgradeClick,
	hasWooCommerce = false,
	siteSlug,
}: ComparisonTableProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const translate = useTranslate();

	return (
		<div className="jetpack-comparison-table">
			<button
				className="jetpack-comparison-table__trigger"
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( prev ) => ! prev ) }
			>
				{ translate( 'Compare all features across plans' ) }
				<Gridicon
					icon={ isOpen ? 'chevron-up' : 'chevron-down' }
					size={ 18 }
					className="jetpack-comparison-table__chevron"
				/>
			</button>

			{ isOpen && (
				<div className="jetpack-comparison-table__body">
					<div className="jetpack-comparison-table__scroll">
						<table className="jetpack-comparison-table__table">
							<thead>
								<tr>
									<th className="jetpack-comparison-table__feature-col">
										{ translate( 'Feature' ) }
									</th>
									{ TABLE_PLAN_KEYS.map( ( key ) => (
										<th
											key={ key }
											className={ clsx( 'jetpack-comparison-table__plan-col', {
												'is-current': key === currentPlanKey,
											} ) }
										>
											{ PLAN_DISPLAY_NAMES[ key ] }
											{ key === currentPlanKey && (
												<span className="jetpack-comparison-table__current-badge">
													{ translate( 'Your plan' ) }
												</span>
											) }
										</th>
									) ) }
								</tr>
							</thead>
							<tbody>
								<UpgradeRow
									currentPlanKey={ currentPlanKey }
									onUpgradeClick={ onUpgradeClick }
									translate={ translate }
								/>

								{ FEATURE_GROUPS.map( ( group ) => (
									<>
										<tr key={ `cat-${ group.id }` } className="jetpack-comparison-table__category">
											<td colSpan={ TABLE_PLAN_KEYS.length + 1 }>
												<div className="jetpack-comparison-table__category-inner">
													{ group.gridicon ? (
														<Gridicon
															icon={ group.gridicon }
															size={ 16 }
															className="jetpack-comparison-table__category-icon"
														/>
													) : (
														<img
															src={ group.iconSrc }
															alt=""
															width={ 16 }
															height={ 16 }
															className="jetpack-comparison-table__category-icon"
														/>
													) }
													{ group.name }
												</div>
											</td>
										</tr>
										{ group.features
											.filter( ( f ) => ! f.requiresWooCommerce || hasWooCommerce )
											.map( ( feature ) => (
												<tr key={ feature.id }>
													<td className="jetpack-comparison-table__feature-name">
														{ feature.path ? (
															<a
																href={ feature.path.replace( ':site', siteSlug ) }
																className="jetpack-comparison-table__feature-link"
															>
																{ feature.name }
															</a>
														) : (
															<span>{ feature.name }</span>
														) }
														<span className="jetpack-comparison-table__feature-desc">
															{ feature.description }
														</span>
													</td>
													{ TABLE_PLAN_KEYS.map( ( key ) => {
														const avail = feature.plans[ key ];
														const { symbol, label } = AVAILABILITY_LABELS[ avail ];
														const note = feature.notes?.[ key ];
														return (
															<td
																key={ key }
																className={ clsx(
																	'jetpack-comparison-table__plan-col',
																	`is-${ avail }`,
																	{ 'is-current': key === currentPlanKey }
																) }
																aria-label={ `${ PLAN_DISPLAY_NAMES[ key ] }: ${ label }${
																	note ? ` — ${ note }` : ''
																}` }
															>
																<span
																	className="jetpack-comparison-table__cell-content"
																	aria-hidden="true"
																>
																	{ symbol }
												<span
													className="jetpack-comparison-table__note-trigger"
													tabIndex={ 0 }
													aria-label={ note }
												>
																	) }
																</span>
															</td>
														);
													} ) }
												</tr>
											) ) }
									</>
								) ) }

								<UpgradeRow
									currentPlanKey={ currentPlanKey }
									onUpgradeClick={ onUpgradeClick }
									translate={ translate }
								/>
							</tbody>
						</table>
					</div>

					<div className="jetpack-comparison-table__legend">
						{ Object.entries( AVAILABILITY_LABELS ).map( ( [ key, { symbol, label } ] ) => (
							<span key={ key } className="jetpack-comparison-table__legend-item">
								<span className={ `is-${ key }` } aria-hidden="true">
									{ symbol }
								</span>
								{ label }
							</span>
						) ) }
					</div>
				</div>
			) }
		</div>
	);
}
