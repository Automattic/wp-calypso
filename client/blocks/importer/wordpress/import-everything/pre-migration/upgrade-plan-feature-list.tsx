import { JetpackPlan, Plan, WPComPlan } from '@automattic/calypso-products';
import { Badge } from '@automattic/components';
import { chevronDown, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { Plans2023Tooltip } from 'calypso/my-sites/plans-grid/components/plans-2023-tooltip';

interface Props {
	plan: Plan | JetpackPlan | WPComPlan | undefined;
}

export const UpgradePlanFeatureList = ( props: Props ) => {
	const { __ } = useI18n();
	const { plan } = props;
	const [ showFeatures, setShowFeatures ] = useState( false );
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );

	const wpcomFeatures = plan
		?.get2023PricingGridSignupWpcomFeatures?.()
		.map( ( feature: string ) => getFeatureByKey( feature ) )
		.filter( ( feature ) => feature?.getTitle() );

	const jetpackFeatures = plan
		?.get2023PricingGridSignupJetpackFeatures?.()
		.map( ( feature: string ) => getFeatureByKey( feature ) )
		.filter( ( feature ) => feature?.getTitle() );

	const storageOptions = plan
		?.get2023PricingGridSignupStorageOptions?.()
		.filter( ( option ) => ! option.isAddOn )
		.map( ( option ) => getFeatureByKey( option.slug ) )
		.filter( ( option ) => option?.getTitle() );

	return (
		<ul className={ classnames( 'import__details-list' ) }>
			{ ! showFeatures && (
				<li className={ classnames( 'import__upgrade-plan-feature-more' ) }>
					<button onClick={ () => setShowFeatures( true ) }>
						{ __( 'Show all features' ) }
						<Icon icon={ chevronDown } />
					</button>
				</li>
			) }

			{ showFeatures && (
				<>
					{ wpcomFeatures?.map( ( feature, i ) => (
						<li className={ classnames( 'import__upgrade-plan-feature' ) } key={ i }>
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

					<li className={ classnames( 'import__upgrade-plan-feature logo' ) }>
						<JetpackLogo size={ 16 } />
					</li>
					{ jetpackFeatures?.map( ( feature, i ) => (
						<li className={ classnames( 'import__upgrade-plan-feature' ) } key={ i }>
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

					<li className={ classnames( 'import__upgrade-plan-feature logo' ) }>
						<strong>{ __( 'Storage' ) }</strong>
					</li>
					<li className={ classnames( 'import__upgrade-plan-feature' ) }>
						{ storageOptions?.map( ( storage, i ) => (
							<Badge type="info" key={ i }>
								{ storage?.getTitle() }
							</Badge>
						) ) }
					</li>
				</>
			) }
		</ul>
	);
};
