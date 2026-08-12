import { Button } from '@wordpress/components';
import { useState } from 'react';
import CelebrationModal from './celebration-modal';
import '../styles.scss';
import type { Meta, StoryObj } from '@storybook/react';

// Renders the real CelebrationModal view. The data/analytics container
// (../index.tsx) is skipped because Storybook does not set up the app's query,
// router, and analytics providers.

interface CelebrationArgs {
	domain: string;
	hasCustomDomain: boolean;
	isPaidPlan: boolean;
	isBilledMonthly: boolean;
}

function CelebrationModalPreview( {
	domain,
	hasCustomDomain,
	isPaidPlan,
	isBilledMonthly,
}: CelebrationArgs ) {
	const [ isOpen, setIsOpen ] = useState( true );

	if ( ! isOpen ) {
		return (
			<Button variant="primary" onClick={ () => setIsOpen( true ) }>
				Open celebration modal
			</Button>
		);
	}

	return (
		<CelebrationModal
			siteDomain={ domain }
			siteUrl="https://example.com"
			hasCustomDomain={ hasCustomDomain }
			isPaidPlan={ isPaidPlan }
			isBilledMonthly={ isBilledMonthly }
			upsellHref="#"
			onUpsellClick={ () => {} }
			onClose={ () => setIsOpen( false ) }
		/>
	);
}

const meta = {
	title: 'client/dashboard/SiteLaunchModal/Celebration',
	component: CelebrationModalPreview,
	parameters: { layout: 'fullscreen' },
} satisfies Meta< typeof CelebrationModalPreview >;

export default meta;
type Story = StoryObj< typeof meta >;

export const FreePlan: Story = {
	args: {
		domain: 'kaonashi.com',
		hasCustomDomain: false,
		isPaidPlan: false,
		isBilledMonthly: false,
	},
};

export const PaidMonthlyPlan: Story = {
	args: {
		...FreePlan.args,
		isPaidPlan: true,
		isBilledMonthly: true,
	},
};

export const CustomDomain: Story = {
	args: {
		...FreePlan.args,
		domain: 'example.com',
		hasCustomDomain: true,
		isPaidPlan: true,
	},
};
