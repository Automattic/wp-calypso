import config from '@automattic/calypso-config';
import Plans from 'calypso/my-sites/plans/main';
import {
	CalypsoWrapper,
	SITE_ID,
	SITE_SLUG,
} from '../../../.storybook-pricing-grids/calypso-wrapper';
import PlansFeaturesMain from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'Pricing grids/Calypso',
	parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

// Props the signup plans step passes (steps-repository/unified-plans/unified-plans-step.tsx).
const signupProps = {
	isInSignup: true,
	plansWithScroll: true,
	showPlanTypeSelectorDropdown: config.isEnabled( 'onboarding/interval-dropdown' ),
};

export const SignupDefault: Story = {
	name: 'Signup: /setup/onboarding/plans (plans-default-wpcom)',
	render: () => (
		<CalypsoWrapper>
			<PlansFeaturesMain { ...signupProps } intent="plans-default-wpcom" flowName="onboarding" />
		</CalypsoWrapper>
	),
};

export const SignupRedesignSixPlanNewDesign: Story = {
	name: 'Signup: /setup/onboarding/plans, experiment calypso_pricing_differentiation_202607 = six_plan_new_design',
	render: () => (
		<CalypsoWrapper
			scenario={ {
				experiments: { calypso_pricing_differentiation_202607: 'six_plan_new_design' },
			} }
		>
			<PlansFeaturesMain { ...signupProps } intent="plans-default-wpcom" flowName="onboarding" />
		</CalypsoWrapper>
	),
};

export const SignupNewsletter: Story = {
	name: 'Signup: /setup/newsletter (plans-newsletter)',
	render: () => (
		<CalypsoWrapper>
			<PlansFeaturesMain { ...signupProps } intent="plans-newsletter" flowName="newsletter" />
		</CalypsoWrapper>
	),
};

export const InAppPersonalSite: Story = {
	name: 'In-app: /plans/<site> on the Personal plan',
	render: () => (
		<CalypsoWrapper
			scenario={ {
				siteId: SITE_ID,
				currentPlanSlug: 'personal-bundle',
				currentPlanProductId: 1009,
			} }
		>
			<Plans context={ { path: `/plans/${ SITE_SLUG }`, query: {}, params: {} } as never } />
		</CalypsoWrapper>
	),
};
