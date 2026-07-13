import { Button, Gridicon } from '@automattic/components';
import { isOnboardingFlow } from '@automattic/onboarding';
import { Plans2023Tooltip, useManageTooltipToggle } from '@automattic/plans-grid-next';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { SelectedFeatureData } from '../hooks/use-selected-feature';

const Subheader = styled.p< { isUsingStepContainerV2?: boolean; isVisualSplitIntent?: boolean } >`
	${ ( props ) =>
		props.isUsingStepContainerV2
			? `
				margin: -2.5rem 0 3rem;
				color: var( --color-text );
				font-size: 0.875rem;
				line-height: 1.5;
				text-wrap: balance;
				text-align: left;
				button.is-borderless {
					font-weight: 500;
					color: inherit;
					text-decoration: underline;
					font-size: inherit;
					padding: 0;
				}
				@media ( min-width: 600px ) {
					text-align: center;
				}
				@media ( min-width: 960px ) {
					font-size: 1rem;
				}
			`
			: `
				margin: ${ props.isVisualSplitIntent ? '-40px 0 30px 0' : '-32px 0 40px 0' };
				color: var( --studio-gray-60 );
				font-size: 1rem;
				text-align: center;
				button.is-borderless {
					font-weight: ${ props.isVisualSplitIntent ? 'inherit' : '500' };
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
			` }
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
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 8px;
		margin-top: -13px;
		margin-bottom: 48px;
		color: var( --color-text );
		font-weight: 400;

		.plans-2023-tooltip__hover-area-container {
			display: inline-flex;
			align-items: center;
		}
	}

	// TODO:
	// This value is grabbed directly from https://github.com/Automattic/wp-calypso/blob/trunk/packages/plans-grid-next/src/index.tsx#L109
	// Ideally there should be a shared constant that can be reused from the CSS side.
	@media ( max-width: 740px ) {
		flex-direction: column;

		&.plans-features-main__differentiator-header {
			flex-direction: row;
		}
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

const DifferentiatorPrefix = styled.span`
	display: inline-flex;
	align-items: center;
	line-height: 20px;
	min-height: 20px;
	white-space: nowrap;
`;

// Inline SVG components
const ShieldIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 2.64648L15.625 5.20315V9.01482C15.625 12.2648 13.5383 15.3398 10.5958 16.3106C10.2089 16.4383 9.79114 16.4383 9.40417 16.3106C6.4625 15.3407 4.375 12.264 4.375 9.01482V5.20315L10 2.64648ZM5.625 6.00815V9.01482C5.625 11.7757 7.4125 14.3382 9.79583 15.1232C9.92833 15.1673 10.0717 15.1673 10.2042 15.1232C12.5875 14.3382 14.375 11.7757 14.375 9.01482V6.00815L10 4.01982L5.625 6.00815Z"
			fill="currentColor"
		/>
	</svg>
);

const ManagedHostingIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14.4793 13.0468C15.0918 12.149 15.4185 11.087 15.4168 10.0002C15.4184 9.00851 15.1465 8.03562 14.631 7.1885L13.5793 7.866C13.9527 8.49016 14.1668 9.22016 14.1668 10.0002C14.1682 10.8471 13.9103 11.6742 13.4277 12.3702L14.4793 13.0468ZM12.8535 14.6052L12.176 13.5543C11.5214 13.956 10.7682 14.1681 10.0002 14.1668C9.20183 14.1668 8.45683 13.9418 7.82266 13.5535L7.146 14.6043C8.00266 15.1368 8.9915 15.4183 10.0002 15.4168C11.0085 15.4184 11.997 15.1372 12.8535 14.6052ZM5.52016 13.0468C4.90803 12.1489 4.58154 11.0869 4.5835 10.0002C4.5835 8.971 4.87016 8.0085 5.36933 7.18933L6.42016 7.866C6.03489 8.51111 5.83212 9.24876 5.8335 10.0002C5.8335 10.8802 6.10683 11.6968 6.57266 12.3693L5.52016 13.0468ZM7.671 6.54433C8.35877 6.07966 9.17014 5.83204 10.0002 5.8335C10.8627 5.8335 11.6635 6.09516 12.3285 6.54433L13.0052 5.49266C12.1159 4.89823 11.0698 4.58175 10.0002 4.5835C8.93012 4.58184 7.88377 4.89861 6.99433 5.4935L7.671 6.54433ZM10.0002 16.6668C11.7683 16.6668 13.464 15.9645 14.7142 14.7142C15.9645 13.464 16.6668 11.7683 16.6668 10.0002C16.6668 8.23205 15.9645 6.53636 14.7142 5.28612C13.464 4.03588 11.7683 3.3335 10.0002 3.3335C8.23205 3.3335 6.53636 4.03588 5.28612 5.28612C4.03588 6.53636 3.3335 8.23205 3.3335 10.0002C3.3335 11.7683 4.03588 13.464 5.28612 14.7142C6.53636 15.9645 8.23205 16.6668 10.0002 16.6668ZM10.0002 12.9168C10.3832 12.9168 10.7625 12.8414 11.1163 12.6948C11.4702 12.5482 11.7917 12.3334 12.0626 12.0626C12.3334 11.7917 12.5482 11.4702 12.6948 11.1163C12.8414 10.7625 12.9168 10.3832 12.9168 10.0002C12.9168 9.61714 12.8414 9.23787 12.6948 8.884C12.5482 8.53014 12.3334 8.20861 12.0626 7.93777C11.7917 7.66693 11.4702 7.45209 11.1163 7.30551C10.7625 7.15894 10.3832 7.0835 10.0002 7.0835C9.22661 7.0835 8.48475 7.39079 7.93777 7.93777C7.39079 8.48475 7.0835 9.22661 7.0835 10.0002C7.0835 10.7737 7.39079 11.5156 7.93777 12.0626C8.48475 12.6095 9.22661 12.9168 10.0002 12.9168Z"
			fill="currentColor"
		/>
	</svg>
);

const FastLoadingIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M10.0005 4.1665C11.1296 4.16656 12.2287 4.4542 13.2017 4.98682L12.271 5.9165C11.5657 5.59092 10.7922 5.41655 10.0005 5.4165C8.5639 5.4165 7.18526 5.98662 6.16943 7.00244C5.15361 8.01826 4.5835 9.39691 4.5835 10.8335C4.58358 12.2699 5.15379 13.6478 6.16943 14.6636L5.28564 15.5474C4.03558 14.2972 3.33358 12.6014 3.3335 10.8335C3.3335 9.06539 4.0354 7.36889 5.28564 6.11865C6.53589 4.86841 8.23238 4.1665 10.0005 4.1665ZM15.8511 7.64014C16.3808 8.61114 16.6665 9.7075 16.6665 10.8335C16.6664 12.6015 15.9645 14.2972 14.7144 15.5474L13.8306 14.6636C14.8463 13.6478 15.4164 12.27 15.4165 10.8335C15.4165 10.0448 15.2436 9.274 14.9204 8.5708L15.8511 7.64014ZM14.5591 5.39111C14.8032 5.14763 15.199 5.14723 15.4429 5.39111C15.6865 5.63501 15.6863 6.03085 15.4429 6.2749L11.2065 10.5103C11.2341 10.6134 11.2505 10.7216 11.2505 10.8335C11.2504 11.5237 10.6907 12.0833 10.0005 12.0835C9.31017 12.0835 8.75055 11.5238 8.75049 10.8335C8.75049 10.1431 9.31013 9.5835 10.0005 9.5835C10.1119 9.58353 10.22 9.59909 10.3228 9.62646L14.5591 5.39111Z"
			fill="currentColor"
		/>
	</svg>
);

const UnlimitedIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.375 4.1665H10.625V16.6665H9.375V4.1665ZM5 8.33317H6.25V16.6665H5V8.33317ZM15 11.6665H13.75V16.6665H15V11.6665Z"
			fill="currentColor"
		/>
	</svg>
);

const IconWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 4px;
	flex-shrink: 0;
	color: inherit;

	svg {
		width: 20px;
		height: 20px;
		color: inherit;
	}
`;

const DifferentiatorIconContainer = styled.span`
	display: inline-flex;
	align-items: center;
	text-align: left;
	font-size: 16px;
	line-height: 20px;
	font-weight: 400;
	color: inherit;
	white-space: nowrap;
`;

const DifferentiatorLabel = styled.span`
	border-bottom: 1px dashed var( --color-text-subtle );
`;

const DifferentiatorHeader = () => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();

	const differentiators = [
		{
			id: 'unlimited-traffic',
			icon: <UnlimitedIcon />,
			title: translate( 'Unlimited traffic' ),
			tooltip: translate( 'No slowdowns, no caps, no matter how much traffic your site gets.' ),
		},
		{
			id: 'managed-hosting',
			icon: <ManagedHostingIcon />,
			title: translate( 'Managed hosting' ),
			tooltip: translate( 'Updates, security, and backups, all taken care of for you.' ),
		},
		{
			id: 'built-in-security',
			icon: <ShieldIcon />,
			title: translate( 'Built-in security' ),
			tooltip: translate( 'Protected from malware, attacks, and spam, right out of the box.' ),
		},
		{
			id: 'fast-site-loading',
			icon: <FastLoadingIcon />,
			title: translate( 'Fast site loading' ),
			tooltip: translate( 'Fast loading worldwide with global CDN and free SSL built in.' ),
		},
	];

	return (
		<HeaderContainer className="plans-features-main__differentiator-header">
			<DifferentiatorPrefix>{ translate( 'Paid plans include:' ) }</DifferentiatorPrefix>
			{ differentiators.map( ( { id, icon, title, tooltip } ) => (
				<Plans2023Tooltip
					key={ id }
					id={ `plans-differentiator-${ id }` }
					text={ tooltip }
					activeTooltipId={ activeTooltipId }
					setActiveTooltipId={ setActiveTooltipId }
				>
					<DifferentiatorIconContainer className="plans-features-main__differentiator-item">
						<IconWrapper>{ icon }</IconWrapper>
						<DifferentiatorLabel>{ title }</DifferentiatorLabel>
					</DifferentiatorIconContainer>
				</Plans2023Tooltip>
			) ) }
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
	renderFreePlanCtaInStepContainerV2,
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
	renderFreePlanCtaInStepContainerV2?: boolean;
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

	const renderStandardSubheader = () => {
		// Website Builder intent: use the new copy
		if ( ! isUsingStepContainerV2 && intent === 'plans-website-builder' ) {
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
		if ( ! isUsingStepContainerV2 && intent === 'plans-wordpress-hosting' ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate(
						'All the security, flexibility, and control you need — without the overhead.'
					) }
				</Subheader>
			);
		}

		// Woo hosting solutions intent: subhead is rendered upstream by the
		// stepper plans step, so suppress this onboarding fallback to avoid
		// stacking two subheads.
		if ( intent === 'plans-woo-hosting-solutions' ) {
			return null;
		}

		if (
			( ! isUsingStepContainerV2 || renderFreePlanCtaInStepContainerV2 ) &&
			deemphasizeFreePlan &&
			offeringFreePlan
		) {
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

		if ( ! isUsingStepContainerV2 && intent === 'plans-upgrade-or-downgrade' ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate(
						'Compare plans and pick the one that works for where your site is headed.'
					) }
				</Subheader>
			);
		}

		if ( ! isUsingStepContainerV2 && ( isOnboarding || intent === 'plans-upgrade' ) ) {
			return (
				<Subheader { ...subheaderCommonProps }>
					{ translate( 'Whatever site you’re building, there’s a plan to make it happen sooner.' ) }
				</Subheader>
			);
		}

		return null;
	};

	const renderSubheader = () => {
		if ( showDifferentiatorHeader ) {
			return (
				<>
					{ renderStandardSubheader() }
					<DifferentiatorHeader />
				</>
			);
		}

		return renderStandardSubheader();
	};

	return (
		<>
			{ renderSubheader() }
			{ isDisplayingPlansNeededForFeature &&
				intent !== 'plans-upgrade' &&
				intent !== 'plans-upgrade-or-downgrade' && (
					<SecondaryFormattedHeader siteSlug={ siteSlug } selectedFeature={ selectedFeature } />
				) }
		</>
	);
};

export default PlansPageSubheader;
