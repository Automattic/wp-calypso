import { Button, Gridicon } from '@automattic/components';
import { OnboardSelect } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { SelectedFeatureData } from '../hooks/use-selected-feature';

const Subheader = styled.p`
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

const SecondaryFormattedHeader = ( {
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

const HeaderContainer = styled( Subheader )`
	display: flex;
	justify-content: center;
	font-size: 16px;
	font-weight: 500;
	margin-bottom: 0;

	// TODO:
	// This value is grabbed directly from https://github.com/Automattic/wp-calypso/blob/trunk/packages/plans-grid-next/src/index.tsx#L109
	// Ideally there should be a shared constant that can be reused from the CSS side.
	@media ( max-width: 740px ) {
		flex-direction: column;
	}
`;

const PrefixSection = styled.p`
	// TODO:
	// The same as above.
	@media ( max-width: 740px ) {
		margin-bottom: 4px;
	}
`;

const FeatureSection = styled.p`
	.gridicon.gridicons-checkmark {
		color: var( --studio-green-50 );
		vertical-align: middle;
		margin-left: 12px;
		margin-right: 4px;
		padding-bottom: 4px;
	}
`;

const PlanBenefitHeader = () => {
	const translate = useTranslate();

	return (
		<HeaderContainer>
			<PrefixSection>{ translate( 'All plans include:' ) }</PrefixSection>
			<FeatureSection>
				{ translate(
					'{{Checkmark}}{{/Checkmark}}Website Building{{Checkmark}}{{/Checkmark}}Hosting{{Checkmark}}{{/Checkmark}}eCommerce',
					{
						components: {
							Checkmark: <Gridicon icon="checkmark" size={ 18 } />,
						},
						comment: 'Checkmark is an icon showing a green check mark.',
					}
				) }
			</FeatureSection>
		</HeaderContainer>
	);
};

// TBD
// It is actually questionable that we implement a subheader here instead of reusing the header mechanism
// provided by the signup framework. How could we unify them?
const PlansPageSubheader = ( {
	siteSlug,
	isDisplayingPlansNeededForFeature,
	deemphasizeFreePlan,
	showPlanBenefits,
	offeringFreePlan,
	onFreePlanCTAClick,
	selectedFeature,
}: {
	siteSlug?: string | null;
	isDisplayingPlansNeededForFeature: boolean;
	deemphasizeFreePlan?: boolean;
	offeringFreePlan?: boolean;
	showPlanBenefits?: boolean;
	onFreePlanCTAClick: () => void;
	selectedFeature: SelectedFeatureData | null;
} ) => {
	const translate = useTranslate();

	const createWithBigSky = useSelect( ( select: ( key: string ) => OnboardSelect ) => {
		const { getCreateWithBigSky } = select( ONBOARD_STORE );
		return getCreateWithBigSky();
	}, [] );

	return (
		<>
			{ createWithBigSky && (
				<Subheader className="plans-features-main__subheader">
					{ translate(
						'Build your site quickly with our AI Website Builder or {{link}}start with a free plan{{/link}}.',
						{
							components: {
								link: <Button onClick={ onFreePlanCTAClick } borderless />,
							},
						}
					) }
				</Subheader>
			) }
			{ ! createWithBigSky && deemphasizeFreePlan && offeringFreePlan ? (
				<Subheader className="plans-features-main__subheader">
					{ translate(
						'Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.',
						{
							components: {
								link: <Button onClick={ onFreePlanCTAClick } borderless />,
							},
						}
					) }
				</Subheader>
			) : (
				showPlanBenefits && <PlanBenefitHeader />
			) }
			{ isDisplayingPlansNeededForFeature && (
				<SecondaryFormattedHeader siteSlug={ siteSlug } selectedFeature={ selectedFeature } />
			) }
		</>
	);
};

export default PlansPageSubheader;
