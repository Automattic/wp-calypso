/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );

import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	getPlan,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { PlanFeaturesHeader } from '../header';

const translate = ( string ) => string;
const props = {
	translate: ( x ) => x,
	planType: PLAN_FREE,
	currentSitePlan: { productSlug: PLAN_FREE },
	isJetpack: null,
	billingTimeFrame: 'for life',
	title: 'Free',
};

function getPropsForPlan( planType ) {
	const planObj = getPlan( planType );
	return {
		...props,
		planType,
		billingTimeFrame: planObj?.getBillingTimeFrame() || '',
		title: planObj?.getTitle() || '',
	};
}

const render = ( el, options ) =>
	renderWithProvider( el, {
		...options,
	} );

describe( 'PlanFeaturesHeader basic tests', () => {
	test( 'should not blow up', () => {
		const { container } = render( <PlanFeaturesHeader { ...props } /> );

		expect( container ).toMatchSnapshot();
	} );
} );

describe( 'PlanFeaturesHeader.getDiscountTooltipMessage()', () => {
	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( productSlug ) => {
		test( `Should return a particular message for free plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( { ...props, currentSitePlan: { productSlug } } );
			expect( comp.getDiscountTooltipMessage() ).toBe( 'Price for the next 12 months' );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( productSlug ) => {
		test( `Should return a particular message for free plans with discount (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...props,
				currentSitePlan: { productSlug },
				discountPrice: 3,
			} );
			expect( comp.getDiscountTooltipMessage() ).toBe(
				"You'll receive a discount for the first year. The plan will renew at %(price)s."
			);
		} );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_MONTHLY,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_MONTHLY,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_MONTHLY,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( productSlug ) => {
		test( `Should render different message for paid plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( { ...props, currentSitePlan: { productSlug } } );
			expect( comp.getDiscountTooltipMessage() ).toBe(
				"You'll receive a discount from the full price of %(price)s because you already have a plan."
			);
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderPlansHeaderNoTabs()', () => {
	[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ].forEach( ( productSlug ) => {
		test( `Should not render "Your Plan" plan pill (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
				popular: false,
				newPlan: false,
				bestValue: false,
				plansWithScroll: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.queryByText( 'Your plan' ) ).not.toBeInTheDocument();
		} );

		test( `Should render "Popular" plan pill (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
				popular: true,
				newPlan: false,
				bestValue: false,
				plansWithScroll: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Popular' ) ).toBeVisible();
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderPlansHeader()', () => {
	[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS, PLAN_PREMIUM_MONTHLY ].forEach( ( productSlug ) => {
		test( `Should render "Your Plan" plan pill and no other plan pills for a paid plan in /plans page (${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( productSlug ),
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Your Plan' ) ).toBeVisible();

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( screen.queryByText( planPillLabel ) ).not.toBeInTheDocument();
			} );
		} );

		test( `Should render "Your Plan" plan pill only, even if plan is Popular (${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( PLAN_PREMIUM ),
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
				popular: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Your Plan' ) ).toBeVisible();

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( screen.queryByText( planPillLabel ) ).not.toBeInTheDocument();
			} );
		} );

		test( `Should not render "Your Plan" plan pill in Signup flow (${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( PLAN_PREMIUM ),
				isPlaceholder: false,
				isInSignup: true,
				currentSitePlan: { productSlug },
			};
			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.queryByText( 'Your Plan' ) ).not.toBeInTheDocument();
		} );

		test( `Should render "Popular" plan pill in Signup flow (${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( PLAN_PREMIUM ),
				isPlaceholder: false,
				isInSignup: true,
				popular: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Popular' ) ).toBeVisible();

			[ 'New', 'Your Plan', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( screen.queryByText( planPillLabel ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ].forEach( ( productSlug ) => {
		test( `Should render "Your Plan" plan pill only even if plan is Best Value in /plans page(${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( productSlug ),
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
				popular: false,
				newPlan: false,
				bestValue: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Your Plan' ) ).toBeVisible();

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( screen.queryByText( planPillLabel ) ).not.toBeInTheDocument();
			} );
		} );

		test( `Should render "Best Value" plan pill if in signup flow(${ productSlug })`, () => {
			const myProps = {
				...getPropsForPlan( productSlug ),
				isPlaceholder: false,
				isInSignup: true,
				popular: false,
				newPlan: false,
				bestValue: true,
			};

			render( <PlanFeaturesHeader { ...myProps } /> );

			expect( screen.getByText( 'Best Value' ) ).toBeVisible();

			[ 'New', 'Popular', 'Your Plan' ].forEach( ( planPillLabel ) => {
				expect( screen.queryByText( planPillLabel ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	[ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ].forEach(
		( productSlug ) => {
			test( `Should not render "Your Plan" plan pill if currently on the free plan`, () => {
				const myProps = {
					...getPropsForPlan( productSlug ),
					isInSignup: false,
					planType: productSlug,
				};

				render( <PlanFeaturesHeader { ...myProps } /> );

				expect( screen.queryByText( 'Your Plan' ) ).not.toBeInTheDocument();
			} );
		}
	);
} );

describe( 'PlanFeaturesHeader.getBillingTimeframe()', () => {
	const myProps = {
		...props,
		discountPrice: 12,
		isPlaceholder: false,
		currentSitePlan: { productSlug: PLAN_PREMIUM },
	};

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( productSlug ) => {
		test( `Should render InfoPopover for free plans (${ productSlug })`, () => {
			const updatedProps = {
				...myProps,
				isJetpack: true,
				planType: productSlug,
			};

			render( <PlanFeaturesHeader { ...updatedProps } /> );

			expect(
				screen.getByRole( 'button', { name: 'More information', expanded: false } )
			).toBeVisible();
		} );
	} );

	[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS ].forEach( ( productSlug ) => {
		test( `Should render InfoPopover for non-jetpack sites (${ productSlug })`, () => {
			const updatedProps = {
				...myProps,
				isJetpack: false,
				planType: productSlug,
			};

			render( <PlanFeaturesHeader { ...updatedProps } /> );

			expect(
				screen.getByRole( 'button', { name: 'More information', expanded: false } )
			).toBeVisible();
		} );

		test( `Should render InfoPopover for AT sites (${ productSlug })`, () => {
			const updatedProps = {
				...myProps,
				isJetpack: true,
				isSiteAT: true,
				planType: productSlug,
			};

			render( <PlanFeaturesHeader { ...updatedProps } /> );

			expect(
				screen.getByRole( 'button', { name: 'More information', expanded: false } )
			).toBeVisible();
		} );

		test( `Should render InfoPopover when hideMonthly is true (${ productSlug })`, () => {
			const updatedProps = {
				...myProps,
				isJetpack: true,
				hideMonthly: true,
				planType: productSlug,
			};

			render( <PlanFeaturesHeader { ...updatedProps } /> );

			expect(
				screen.getByRole( 'button', { name: 'More information', expanded: false } )
			).toBeVisible();
		} );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( ( productSlug ) => {
		test( `Should not render InfoPopover for paid plans (${ productSlug })`, () => {
			const updatedProps = {
				...myProps,
				isJetpack: true,
				planType: productSlug,
			};

			render( <PlanFeaturesHeader { ...updatedProps } /> );

			expect(
				screen.queryByRole( 'button', { name: 'More information', expanded: false } )
			).not.toBeInTheDocument();
		} );
	} );
} );

describe( 'PlanIntervalDiscount', () => {
	const baseProps = {
		isYearly: true,
		rawPrice: 22,
		relatedMonthlyPlan: { raw_price: 2 },
		translate,
		billingTimeFrame: '',
		title: '',
		planType: PLAN_JETPACK_FREE,
		basePlansPath: '/plans',
	};
	test( 'should show interval discount for Jetpack during signup', () => {
		render( <PlanFeaturesHeader { ...baseProps } isInSignup isJetpack /> );

		expect( screen.getByText( 'Save', { exact: false } ) ).toBeVisible();
		expect( screen.getByText( '$2.00', { exact: false } ) ).toBeVisible();
		expect( screen.getByText( 'over', { exact: false } ) ).toBeVisible();
		expect( screen.getByText( 'monthly', { exact: false } ) ).toBeVisible();
	} );

	test( 'should not show interval discount for Jetpack outside signup', () => {
		render( <PlanFeaturesHeader { ...baseProps } isJetpack /> );

		expect( screen.queryByText( 'Save', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '$2.00', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'over', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'monthly', { exact: false } ) ).not.toBeInTheDocument();
	} );

	test( 'should not show interval discount for simple during signup', () => {
		render( <PlanFeaturesHeader { ...baseProps } isInSignup /> );

		expect( screen.queryByText( 'Save', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '$2.00', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'over', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'monthly', { exact: false } ) ).not.toBeInTheDocument();
	} );

	test( 'should not show interval discount for atomic during signup', () => {
		render( <PlanFeaturesHeader { ...baseProps } isInSignup isJetpack isSiteAT /> );

		expect( screen.queryByText( 'Save', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '$2.00', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'over', { exact: false } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'monthly', { exact: false } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'PlanFeaturesHeader.renderPriceGroup()', () => {
	const baseProps = {
		currencyCode: 'USD',
		isInSignup: false,
		translate,
		currentSitePlan: { productSlug: PLAN_FREE },
		planType: PLAN_FREE,
		billingTimeFrame: 'for life',
		title: 'Free',
	};
	test( 'Should return a single, not discounted price when a single price is passed', () => {
		const { container } = render( <PlanFeaturesHeader { ...baseProps } rawPrice={ 15 } /> );

		expect( container ).toMatchSnapshot();
	} );
	test( 'Should return two prices when two numbers are passed: one original and one discounted', () => {
		const { container } = render(
			<PlanFeaturesHeader { ...baseProps } rawPrice={ 15 } discountPrice={ 12 } />
		);

		expect( container ).toMatchSnapshot();
	} );
} );

describe( 'PlanFeaturesHeader.getPlanFeaturesPrices()', () => {
	describe( 'Placeholder', () => {
		const baseProps = {
			currencyCode: 'USD',
			isInSignup: false,
			translate,
			currentSitePlan: { productSlug: PLAN_FREE },
			billingTimeFrame: 'for life',
			planType: PLAN_FREE,
			title: 'Free',
		};

		test( 'Should return a placeholder when isPlaceholder=true and isInSignup=false', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } isPlaceholder isInSignup={ false } />
			);

			const price = container.querySelector( '.plan-features__price' );
			expect( price ).toBeVisible();
			expect( price ).toHaveClass( 'is-placeholder' );
			expect( price ).toBeEmptyDOMElement();
		} );

		test( 'Placeholder should have a class .plan-features__price for non-jetpack sites', () => {
			const { container } = render(
				<PlanFeaturesHeader
					{ ...baseProps }
					isPlaceholder
					isInSignup={ false }
					isJetpack={ false }
				/>
			);

			const price = container.querySelector( '.plan-features__price' );
			expect( price ).toBeVisible();
			expect( price ).toHaveClass( 'is-placeholder' );
			expect( price ).toBeEmptyDOMElement();

			const jetpackPrice = container.querySelector( '.plan-features__price-jetpack' );
			expect( jetpackPrice ).not.toBeInTheDocument();
		} );

		test( 'Placeholder should have a class .plan-features__price-jetpack for non-jetpack sites', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } isPlaceholder isInSignup={ false } isJetpack />
			);

			const price = container.querySelector( '.plan-features__price' );
			expect( price ).not.toBeInTheDocument();

			const jetpackPrice = container.querySelector( '.plan-features__price-jetpack' );
			expect( jetpackPrice ).toBeVisible();
			expect( jetpackPrice ).toHaveClass( 'is-placeholder' );
			expect( jetpackPrice ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'has relatedMonthlyPlan', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate,
			currentSitePlan: { productSlug: PLAN_FREE },
			relatedMonthlyPlan: { raw_price: 5 },
			rawPrice: 50,
			isJetpack: true,
			billingTimeFrame: 'yearly',
			planType: PLAN_FREE,
			title: 'Free',
		};

		test( 'Full price should be monthly price * 12 and discounted price should be rawPrice when no discountPrice is passed', () => {
			const { container } = render( <PlanFeaturesHeader { ...baseProps } /> );

			expect( container ).toMatchSnapshot();
		} );

		test( "Full price should be monthly price * 12 and discounted price should be discountPrice when it's passed", () => {
			const { container } = render( <PlanFeaturesHeader { ...baseProps } discountPrice={ 30 } /> );

			expect( container ).toMatchSnapshot();
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } discountPrice={ 30 } availableForPurchase={ false } />
			);

			expect( container ).toMatchSnapshot();
		} );
	} );

	describe( 'has discountPrice', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate,
			currentSitePlan: { productSlug: PLAN_FREE },
			discountPrice: 40,
			rawPrice: 50,
			planType: PLAN_FREE,
			billingTimeFrame: 'yearly',
			title: 'Free',
		};

		test( 'Full price should be rawPrice and discounted price should be discountPrice', () => {
			const { container } = render( <PlanFeaturesHeader { ...baseProps } /> );

			expect( container ).toMatchSnapshot();
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } discountPrice={ 30 } availableForPurchase={ false } />
			);

			expect( container ).toMatchSnapshot();
		} );

		test( 'Should return crossed price when First Year Promotional discount is applied', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } discountPrice={ 30 } isFirstYearPromotionalDiscount />
			);

			expect( container ).toMatchSnapshot();
		} );
	} );

	describe( 'has only rawPrice', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate,
			currentSitePlan: { productSlug: PLAN_FREE },
			rawPrice: 50,
			planType: PLAN_FREE,
			billingTimeFrame: 'yearly',
			title: 'Free',
		};

		test( 'Full price should be rawPrice', () => {
			const { container } = render( <PlanFeaturesHeader { ...baseProps } /> );

			expect( container ).toMatchSnapshot();
		} );

		test( 'Should behave in the same way when availableForPurchase is false', () => {
			const { container } = render(
				<PlanFeaturesHeader { ...baseProps } availableForPurchase={ false } />
			);

			expect( container ).toMatchSnapshot();
		} );
	} );
} );

describe( 'PlanFeaturesHeader.render()', () => {
	describe( 'For free users', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate,
			currentSitePlan: { productSlug: PLAN_FREE },
			rawPrice: 9,
			isJetpack: true,
			billingTimeFrame: 'monthly',
			title: 'Premium',
		};

		test( "Rendering monthly plan should yield no discount if there's no discountPrice", () => {
			const { container } = render(
				<PlanFeaturesHeader
					{ ...baseProps }
					planType={ PLAN_JETPACK_PREMIUM_MONTHLY }
					billingTimeFrame="monthly"
				/>
			);

			expect( container ).toMatchSnapshot();
		} );

		test( "Rendering annual plan should show monthly price * 12 discounted to regular price if there's no discountPrice", () => {
			const { container } = render(
				<PlanFeaturesHeader
					{ ...baseProps }
					planType={ PLAN_JETPACK_PREMIUM }
					relatedMonthlyPlan={ { raw_price: 9 } }
					billingTimeFrame="yearly"
				/>
			);

			expect( container ).toMatchSnapshot();
		} );

		test( 'Rendering annual plan should show monthly price * 12 discounted to discountPrice if one is passed', () => {
			const { container } = render(
				<PlanFeaturesHeader
					{ ...baseProps }
					planType={ PLAN_JETPACK_PREMIUM }
					relatedMonthlyPlan={ { raw_price: 9 } }
					billingTimeFrame="yearly"
					discountPrice={ 60 }
				/>
			);

			expect( container ).toMatchSnapshot();
		} );

		test( "Rendering annual plan should show rawPrice with no discounts if there's no discountPrice and relatedMonthlyPlan", () => {
			const { container } = render(
				<PlanFeaturesHeader
					{ ...baseProps }
					planType={ PLAN_JETPACK_PREMIUM }
					billingTimeFrame="yearly"
					rawPrice={ 60 }
				/>
			);

			expect( container ).toMatchSnapshot();
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderCreditLabel()', () => {
	const baseProps = {
		showPlanCreditsApplied: true,
		availableForPurchase: true,
		planType: PLAN_PREMIUM,
		currentSitePlan: { productSlug: PLAN_PERSONAL },
		billingTimeFrame: 'yearly',
		title: 'Personal',
		rawPrice: 100,
		discountPrice: 80,
		translate,
		isJetpack: false,
		isSiteAT: false,
	};

	test( 'Should display credit label for discounted higher-tier plans that are available for purchase', () => {
		render( <PlanFeaturesHeader { ...baseProps } /> );

		expect( screen.getByText( 'Credit applied' ) ).toBeVisible();
	} );

	test( 'Should not display credit label when plan is not available for purchase', () => {
		render( <PlanFeaturesHeader { ...baseProps } availableForPurchase={ false } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display credit label when showPlanCreditsApplied is false', () => {
		render( <PlanFeaturesHeader { ...baseProps } showPlanCreditsApplied={ false } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display credit label when rendered plan is the same as current plan', () => {
		render( <PlanFeaturesHeader { ...baseProps } planType={ PLAN_PERSONAL } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display credit label when there is no discount price', () => {
		render( <PlanFeaturesHeader { ...baseProps } discountPrice={ 0 } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display credit label when discount price is equal to rawPrice', () => {
		render( <PlanFeaturesHeader { ...baseProps } discountPrice={ 100 } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display credit label when discount price is higher than rawPrice', () => {
		render( <PlanFeaturesHeader { ...baseProps } discountPrice={ 101 } /> );

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );

	test( 'Should display credit label for atomic site on Business plan', () => {
		render(
			<PlanFeaturesHeader { ...baseProps } planType={ PLAN_JETPACK_PREMIUM } isJetpack isSiteAT />
		);

		expect( screen.getByText( 'Credit applied' ) ).toBeVisible();
	} );

	test( 'Should not display credit label for Jetpack site', () => {
		render(
			<PlanFeaturesHeader
				{ ...baseProps }
				planType={ PLAN_JETPACK_PREMIUM }
				isJetpack
				isSiteAT={ false }
			/>
		);

		expect( screen.queryByText( 'Credit applied' ) ).not.toBeInTheDocument();
	} );
} );
