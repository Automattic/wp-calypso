import {
	type JetpackPlan,
	type Plan,
	type WPComPlan,
	getFeatureByKey,
	isMonthly,
} from '@automattic/calypso-products';
import { Badge } from '@automattic/components';
import { Plans2023Tooltip } from '@automattic/plans-grid-next';
import { chevronDown, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import React, { useState } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';

interface Props {
	plan: Plan | JetpackPlan | WPComPlan | undefined;
	showFeatures: boolean;
	setShowFeatures: ( showFeatures: boolean ) => void;
}

export const UpgradePlanFeatureList = ( props: Props ) => {
	const { __ } = useI18n();
	const { plan, showFeatures, setShowFeatures } = props;
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );

	const isMonthlyPlan = plan ? isMonthly( plan.getStoreSlug() ) : false;
	const annualOnlyFeatures = ( plan as WPComPlan )?.getAnnualPlansOnlyFeatures?.() || [];

	const wpcomFeatures = plan
		?.get2023PricingGridSignupWpcomFeatures?.()
		.filter( ( feature: string ) =>
			isMonthlyPlan ? ! annualOnlyFeatures.includes( feature ) : true
		)
		.map( ( feature: string ) => getFeatureByKey( feature ) )
		.filter( ( feature ) => feature?.getTitle() );

	const jetpackFeatures = plan
		?.get2023PricingGridSignupJetpackFeatures?.()
		.map( ( feature: string ) => getFeatureByKey( feature ) )
		.filter( ( feature ) => feature?.getTitle() );

	const storageFeature = plan?.getStorageFeature?.();
	const storageFeatureTitle = storageFeature
		? getFeatureByKey( storageFeature )?.getTitle()
		: undefined;

	return (
		<ul className={ clsx( 'import__details-list' ) }>
			{ ! showFeatures && (
				<li className={ clsx( 'import__upgrade-plan-feature-more' ) }>
					<button onClick={ () => setShowFeatures( true ) }>
						{ __( 'Show all features' ) }
						<Icon size={ 18 } icon={ chevronDown } />
					</button>
				</li>
			) }

			{ showFeatures && (
				<>
					{ wpcomFeatures?.map( ( feature, i ) => (
						<li className={ clsx( 'import__upgrade-plan-feature' ) } key={ i }>
							<Plans2023Tooltip
								id={ `feature-${ i }` }
								text={ feature?.getDescription?.() }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
							>
								{ i === 0 && <strong>{ feature?.getTitle() }</strong> }
								{ i > 0 && <span>{ feature?.getTitle() }</span> }
							</Plans2023Tooltip>
						</li>
					) ) }

					{ jetpackFeatures && jetpackFeatures.length > 0 && (
						<>
							<li className={ clsx( 'import__upgrade-plan-feature logo' ) }>
								<JetpackLogo size={ 16 } />
							</li>
							{ jetpackFeatures?.map( ( feature, i ) => (
								<li className={ clsx( 'import__upgrade-plan-feature' ) } key={ i }>
									<Plans2023Tooltip
										id={ `jetpack-feature-${ i }` }
										text={ feature?.getDescription?.() }
										setActiveTooltipId={ setActiveTooltipId }
										activeTooltipId={ activeTooltipId }
									>
										<span>{ feature?.getTitle() }</span>
									</Plans2023Tooltip>
								</li>
							) ) }
						</>
					) }
					<li className={ clsx( 'import__upgrade-plan-feature logo' ) }>
						<strong>{ __( 'Storage' ) }</strong>
					</li>
					<li className={ clsx( 'import__upgrade-plan-feature' ) }>
						<Badge type="info">{ storageFeatureTitle }</Badge>
					</li>
				</>
			) }
		</ul>
	);
};
