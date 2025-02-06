import JetpackUpsellCard from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackUpsellCard > = {
	title: 'packages/components/Jetpack Upsell Card',
	component: JetpackUpsellCard,
	decorators: [
		( Story ) => (
			<div
				className="jetpack-upsell-section-story"
				style={ { margin: 'auto', maxWidth: '1000px' } }
			>
				<Story />
			</div>
		),
	],
};
export default meta;

const upgradeUrls = {
	backup: 'https://jetpack.com',
	boost: 'https://jetpack.com',
	search: 'https://jetpack.com',
	security: 'https://jetpack.com',
	social: 'https://jetpack.com',
	video: 'https://jetpack.com',
};

export const Default: StoryObj< typeof JetpackUpsellCard > = {
	args: {
		purchasedProducts: [],
		upgradeUrls,
	},
};
export const WithACustomSiteSlug: StoryObj< typeof JetpackUpsellCard > = {
	args: {
		...Default.args,
		siteSlug: 'YourCustomDomain.com',
	},
};

export const WithNoUpgradeUrls: StoryObj< typeof JetpackUpsellCard > = {
	render: ( props ) => (
		<>
			<JetpackUpsellCard { ...props } />
			<p>Nothing should be rendered for this story.</p>
		</>
	),
	args: {
		...Default.args,
		upgradeUrls: {},
	},
};
