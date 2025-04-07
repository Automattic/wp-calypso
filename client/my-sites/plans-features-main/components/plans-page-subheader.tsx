import { Button } from '@automattic/components';
import { OnboardSelect } from '@automattic/data-stores';
import { isOnboardingFlow } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { SelectedFeatureData } from '../hooks/use-selected-feature';

export const Subheader = styled.p`
	margin: -32px 0 40px 0;
	color: var( --studio-gray-60 );
	font-size: 1rem;
	text-align: center;
	button.is-borderless {
		font-weight: 500;
		color: var( --studio-gray-90 );
		text-decoration: underline;
		font-size: 16px;
		padding: 0;
	}
	@media ( max-width: 960px ) {
		margin-top: -16px;
	}
`;

export const SecondaryFormattedHeader = ( {
	siteSlug,
	selectedFeature,
}: {
	siteSlug?: string | null;
	selectedFeature: SelectedFeatureData | null;
} ) => {
	const translate = useTranslate();
	let headerText: ReactNode = translate( 'Upgrade your plan to access this feature and more' );
	let subHeaderText: ReactNode = (
		<Button className="plans-features-main__view-all-plans is-link" href={ `/plans/${ siteSlug }` }>
			{ translate( 'View all plans' ) }
		</Button>
	);
	if ( selectedFeature?.description ) {
		headerText = selectedFeature.description;
		subHeaderText = translate(
			'Upgrade your plan to access this feature and more. Or {{button}}view all plans{{/button}}.',
			{
				components: {
					button: (
						<Button
							className="plans-features-main__view-all-plans is-link"
							href={ `/plans/${ siteSlug }` }
						/>
					),
				},
			}
		);
	}

	return (
		<FormattedHeader
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			compactOnMobile
			isSecondary
		/>
	);
};

export const usePlansPageSubheaderText = ( {
	deemphasizeFreePlan,
	offeringFreePlan,
	flowName,
	onFreePlanCTAClick,
}: {
	deemphasizeFreePlan?: boolean;
	offeringFreePlan?: boolean;
	flowName?: string | null;
	onFreePlanCTAClick: () => void;
} ): React.ReactNode => {
	const translate = useTranslate();

	const createWithBigSky = useSelect( ( select: ( key: string ) => OnboardSelect ) => {
		const { getCreateWithBigSky } = select( ONBOARD_STORE );
		return getCreateWithBigSky();
	}, [] );

	const isOnboarding = isOnboardingFlow( flowName ?? null );

	if ( createWithBigSky ) {
		return translate(
			'Build your site quickly with our AI Website Builder or {{link}}start with a free plan{{/link}}.',
			{
				components: {
					link: <Button onClick={ onFreePlanCTAClick } borderless />,
				},
			}
		);
	}

	if ( ! createWithBigSky && deemphasizeFreePlan && offeringFreePlan ) {
		return translate(
			'Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.',
			{
				components: {
					link: <Button onClick={ onFreePlanCTAClick } borderless />,
				},
			}
		);
	}

	if ( isOnboarding ) {
		return translate( 'Whatever site you’re building, there’s a plan to make it happen sooner.' );
	}

	return null;
};
