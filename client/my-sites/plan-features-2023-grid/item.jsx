import classNames from 'classnames';

export function PlanFeaturesItem( props ) {
	const itemInfoClasses = classNames( 'plan-features-2023-grid__item-info-container', {
		'plan-features-2023-grid__item-info-annual-only': props.annualOnlyContent,
	} );

	return (
		<div
			className="plan-features-2023-grid__item plan-features-2023-grid__item-available"
			key={ props.key }
		>
			{ props.annualOnlyContent && (
				<div className="plan-features-2023-grid__item-annual-plan-container">
					{ props.annualOnlyContent }
				</div>
			) }
			<div className={ itemInfoClasses }>{ props.children }</div>
		</div>
	);
}
