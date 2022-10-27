import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import MaterialIcon from 'calypso/components/material-icon';

function renderIcon( gridIconClasses, gridIconName, materialIconName ) {
	if ( materialIconName ) {
		return (
			<MaterialIcon
				icon={ materialIconName }
				className="plan-comparison-with-highlights__item-material-icon"
			/>
		);
	}

	return <Gridicon className={ gridIconClasses } size={ 18 } icon={ gridIconName } />;
}

export function PlanFeaturesItem( props ) {
	const itemInfoClasses = classNames( 'plan-comparison-with-highlights__item-info-container', {
		'plan-comparison-with-highlights__item-info-annual-only': props.annualOnlyContent,
	} );
	const gridIconName = props.isFeatureAvailable ? 'checkmark' : 'cross';
	const gridIconClasses = classNames( {
		'plan-comparison-with-highlights__item-checkmark': props.isFeatureAvailable,
		'plan-comparison-with-highlights__item-cross': ! props.isFeatureAvailable,
	} );

	return (
		<div className="plan-comparison-with-highlights__item plan-comparison-with-highlights__item-available">
			{ props.annualOnlyContent && (
				<div className="plan-comparison-with-highlights__item-annual-plan-container">
					{ props.annualOnlyContent }
				</div>
			) }

			<div className={ itemInfoClasses }>
				{ renderIcon( gridIconClasses, gridIconName, props.materialIconName ) }
				{ props.children }
			</div>
		</div>
	);
}
