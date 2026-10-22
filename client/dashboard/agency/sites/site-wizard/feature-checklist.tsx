import { Button, VisuallyHidden } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, Icon } from '@wordpress/icons';
import { useTermTooltip } from '../../components/term-tooltip';
import type { ComponentProps } from 'react';

type Feature = {
	label: string;
	detail: string;
	icon?: ComponentProps< typeof Icon >[ 'icon' ];
	included?: boolean;
	placeholderLabel?: string;
};

function FeatureItem( {
	feature: { label, detail, icon, included = true, placeholderLabel },
	hideUnavailableLabels,
}: {
	feature: Feature;
	hideUnavailableLabels: boolean;
} ) {
	const { triggerProps, tooltip } = useTermTooltip< HTMLButtonElement >( detail );
	const isPlaceholder = hideUnavailableLabels && ! included;
	const unavailableStatus = isPlaceholder ? __( ': Not applicable' ) : __( ': Not included' );

	return (
		<li data-included={ included }>
			<Button { ...triggerProps } className="agency-site-wizard__feature" type="button">
				{ included && <Icon icon={ icon ?? check } size={ 18 } aria-hidden="true" /> }
				{ isPlaceholder ? (
					<>
						<VisuallyHidden>{ label }</VisuallyHidden>
						{ placeholderLabel && (
							<span className="agency-site-wizard__feature-placeholder-label" aria-hidden="true">
								{ placeholderLabel }
							</span>
						) }
					</>
				) : (
					<span>{ label }</span>
				) }
				<VisuallyHidden>{ included ? __( ': Included' ) : unavailableStatus }</VisuallyHidden>
			</Button>
			{ tooltip }
		</li>
	);
}

export default function FeatureChecklist( {
	title,
	features,
	hideUnavailableLabels = false,
}: {
	title: string;
	features: Feature[];
	hideUnavailableLabels?: boolean;
} ) {
	return (
		<ul
			className="agency-site-wizard__feature-checklist"
			aria-label={ sprintf(
				/* translators: %s is the name of a site setup option. */
				__( '%s features' ),
				title
			) }
		>
			{ features.map( ( feature ) => (
				<FeatureItem
					key={ feature.label }
					feature={ feature }
					hideUnavailableLabels={ hideUnavailableLabels }
				/>
			) ) }
		</ul>
	);
}
