import { Title, SubTitle } from '@automattic/onboarding';
import { check, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { ReactNode } from 'react';
import clockIcon from 'calypso/assets/images/jetpack/clock-icon.svg';

interface TrialPlanProps {
	subtitle: ReactNode;
	supportingCopy: ReactNode;
	trialLimitations?: string[];
	planFeatures: string[];
	callToAction: ReactNode;
}

export const TrialPlan = ( {
	subtitle,
	supportingCopy,
	planFeatures,
	trialLimitations,
	callToAction,
}: TrialPlanProps ) => {
	const { __ } = useI18n();

	const formats =
		trialLimitations &&
		new Intl.ListFormat( i18n.getLocaleSlug() ?? 'en', {
			style: 'long',
			type: 'conjunction',
		} ).format( trialLimitations );

	return (
		<div className="trial-plan--container">
			<Title>{ __( 'Try before you buy' ) }</Title>
			<SubTitle>{ subtitle }</SubTitle>
			<p>{ supportingCopy }</p>

			{ planFeatures?.length > 0 && (
				<div className="trial-plan--details">
					<div className="trial-plan--details-features">
						<ul>
							{ planFeatures.map( ( feature, i ) => (
								<li key={ i }>
									<Icon size={ 20 } icon={ check } /> { feature }
								</li>
							) ) }
						</ul>
					</div>
				</div>
			) }

			{ trialLimitations && (
				<div className="trial-plan--details-limitation">
					<img src={ clockIcon } alt={ __( 'Limit' ) } />
					<p>
						<strong>{ __( 'Trial limitations' ) }</strong>
						<br />
						<small>{ formats }</small>
					</p>
				</div>
			) }

			{ callToAction }
		</div>
	);
};
