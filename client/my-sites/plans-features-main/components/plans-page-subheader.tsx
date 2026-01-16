import { Button, Gridicon } from '@automattic/components';
import { isOnboardingFlow } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { SelectedFeatureData } from '../hooks/use-selected-feature';

const Subheader = styled.p< { isUsingStepContainerV2?: boolean; isVisualSplitIntent?: boolean } >`
	margin: ${ ( props ) => ( props.isVisualSplitIntent ? '-40px 0 30px 0' : '-32px 0 40px 0' ) };
	color: var( --studio-gray-60 );
	font-size: 1rem;
	text-align: ${ ( props ) => ( props.isUsingStepContainerV2 ? 'left' : 'center' ) };
	button.is-borderless {
		font-weight: ${ ( props ) => ( props.isVisualSplitIntent ? 'inherit' : '500' ) };
		color: var( --studio-gray-90 );
		text-decoration: underline;
		font-size: 16px;
		padding: 0;
	}
	@media ( max-width: 960px ) {
		margin-top: -16px;
	}
	@media ( min-width: 600px ) {
		text-align: center;
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

	&.plans-features-main__differentiator-header {
		margin-top: -20px;
		margin-bottom: 32px;
	}

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

// Inline SVG components
const ShieldPlusIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.12404 5.23988C8.0952 5.51646 7.07304 5.81729 6.05841 6.14212C5.96659 6.17047 5.88463 6.22414 5.82194 6.29698C5.75926 6.36981 5.71839 6.45886 5.70404 6.55387C5.10441 10.938 6.48816 14.1375 8.13854 16.2446C8.96654 17.3021 9.86316 18.0851 10.6102 18.5992C10.9848 18.8558 11.3144 19.0425 11.5743 19.1617C11.7048 19.2214 11.8105 19.2619 11.8915 19.2855C11.9273 19.297 11.9637 19.306 12.0007 19.3125C12.0085 19.3114 12.0434 19.3069 12.1098 19.2866C12.1908 19.2619 12.2965 19.2214 12.427 19.1617C12.6858 19.0425 13.0177 18.8558 13.3912 18.5992C14.3279 17.942 15.161 17.1484 15.8628 16.2446C17.5132 14.1375 18.8969 10.938 18.2973 6.55387C18.2829 6.45886 18.2421 6.36981 18.1794 6.29698C18.1167 6.22414 18.0347 6.17047 17.9429 6.14212C17.2387 5.91712 16.0507 5.55038 14.8773 5.23988C13.678 4.92375 12.5744 4.6875 12.0007 4.6875C11.4269 4.6875 10.3244 4.92375 9.12404 5.23988ZM8.83604 4.15312C10.0094 3.84262 11.2548 3.5625 12.0007 3.5625C12.7454 3.5625 13.9919 3.84262 15.1653 4.15312C16.2119 4.43412 17.2517 4.73983 18.2838 5.07C18.8778 5.259 19.3255 5.77087 19.4122 6.402C20.0568 11.1236 18.5617 14.6224 16.7493 16.9376C15.977 17.9312 15.06 18.8034 14.029 19.5251C13.6706 19.7762 13.2916 19.9968 12.8962 20.1844C12.5924 20.3239 12.2684 20.4375 12.0007 20.4375C11.7329 20.4375 11.4089 20.3239 11.1052 20.1844C10.7096 19.9969 10.3307 19.7764 9.97229 19.5251C8.94172 18.8033 8.02516 17.9311 7.25316 16.9376C5.43854 14.6224 3.94454 11.1236 4.58916 6.402C4.63226 6.09608 4.76112 5.80862 4.96081 5.57289C5.1605 5.33716 5.42286 5.16281 5.71754 5.07C6.74967 4.73984 7.78946 4.43413 8.83604 4.15312Z"
			fill="#3858E9"
		/>
		<path d="M12 8V13.5" stroke="#3858E9" strokeLinecap="round" strokeLinejoin="round" />
		<path
			d="M14.7539 10.7461L9.25391 10.7461"
			stroke="#3858E9"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const UnlimitedIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
		<path
			d="M16 18L16 6M16 6L20 10.125M16 6L12 10.125"
			stroke="#3858E9"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M8 6L8 18M8 18L12 13.875M8 18L4 13.875"
			stroke="#3858E9"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const IconWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 8px;
	flex-shrink: 0;
	color: var( --studio-blue-60 );

	svg {
		width: 24px;
		height: 24px;
		fill: var( --studio-blue-60 );
		color: var( --studio-blue-60 );
	}
`;

const DifferentiatorIconContainer = styled.span`
	display: inline-flex;
	align-items: center;
	margin-right: 12px;
	padding: 10px 16px;
	background-color: var( --studio-blue-5 );
	border-radius: 8px;
	text-align: left;
	font-size: 14px;
	line-height: 24px;
	font-weight: 400;
	color: var( --studio-gray-70 );

	&:last-child {
		margin-right: 0;
	}

	@media ( max-width: 740px ) {
		margin-right: 0;
		margin-bottom: 8px;
		width: 100%;

		&:last-child {
			margin-bottom: 0;
		}
	}
`;

const DifferentiatorHeader = () => {
	const translate = useTranslate();

	return (
		<HeaderContainer className="plans-features-main__differentiator-header">
			<DifferentiatorIconContainer>
				<IconWrapper>
					<UnlimitedIcon />
				</IconWrapper>
				{ translate( 'Unlimited pages, posts, users and visitors' ) }
			</DifferentiatorIconContainer>
			<DifferentiatorIconContainer>
				<IconWrapper>
					<ShieldPlusIcon />
				</IconWrapper>
				{ translate( 'Spam, brutforce, DDoS protection and mitigation' ) }
			</DifferentiatorIconContainer>
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
	flowName,
	onFreePlanCTAClick,
	selectedFeature,
	intent,
	showDifferentiatorHeader,
}: {
	siteSlug?: string | null;
	isDisplayingPlansNeededForFeature: boolean;
	deemphasizeFreePlan?: boolean;
	offeringFreePlan?: boolean;
	showPlanBenefits?: boolean;
	flowName?: string | null;
	onFreePlanCTAClick: () => void;
	selectedFeature: SelectedFeatureData | null;
	intent?: string;
	showDifferentiatorHeader?: boolean;
} ) => {
	const translate = useTranslate();

	const isOnboarding = isOnboardingFlow( flowName ?? null );

	const isUsingStepContainerV2 = Boolean( flowName && shouldUseStepContainerV2( flowName ) );

	const isVisualSplitIntent =
		intent === 'plans-wordpress-hosting' || intent === 'plans-website-builder';

	const subheaderCommonProps = {
		isUsingStepContainerV2,
		isVisualSplitIntent,
	};

	const renderSubheader = () => {
		// Differentiators experiment: show the differentiator header with 3 bullet points
		if ( showDifferentiatorHeader ) {
			return <DifferentiatorHeader />;
		}

		// Website Builder intent: use the new copy
		if ( intent === 'plans-website-builder' ) {
			if ( deemphasizeFreePlan && offeringFreePlan ) {
				return (
					<Subheader { ...subheaderCommonProps }>
						{ translate(
							'Everything you need to go from idea to one-of-a-kind site, blog, or newsletter. Or {{link}}start with our free plan{{/link}}.',
							{ components: { link: <Button onClick={ onFreePlanCTAClick } borderless /> } }
						) }
					</Subheader>
				);
			}

			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate(
						'Everything you need to go from idea to one-of-a-kind site, blog, or newsletter.'
					) }
				</Subheader>
			);
		}

		// WordPress Hosting intent: use hosting-specific copy
		if ( intent === 'plans-wordpress-hosting' ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate(
						'All the security, flexibility, and control you need — without the overhead.'
					) }
				</Subheader>
			);
		}
		if ( deemphasizeFreePlan && offeringFreePlan ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate(
						'Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.',
						{
							components: {
								link: <Button onClick={ onFreePlanCTAClick } borderless />,
							},
						}
					) }
				</Subheader>
			);
		}

		if ( showPlanBenefits ) {
			return <PlanBenefitHeader />;
		}

		if ( isOnboarding || intent === 'plans-upgrade' ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate( 'Whatever site you’re building, there’s a plan to make it happen sooner.' ) }
				</Subheader>
			);
		}

		return null;
	};

	return (
		<>
			{ renderSubheader() }
			{ isDisplayingPlansNeededForFeature && intent !== 'plans-upgrade' && (
				<SecondaryFormattedHeader siteSlug={ siteSlug } selectedFeature={ selectedFeature } />
			) }
		</>
	);
};

export default PlansPageSubheader;
