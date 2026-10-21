import { BundlePrice } from '.';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof BundlePrice > = {
	title: 'UI/BundlePrice',
	component: BundlePrice,
};

export default meta;

export const LeftAligned = () => (
	<BundlePrice originalPrice="$75" bundlePrice="$60" renewalPrice="$75" />
);

export const RightAligned = () => (
	<BundlePrice originalPrice="$75" bundlePrice="$60" renewalPrice="$75" alignment="right" />
);

export const WithoutRenewal = () => <BundlePrice originalPrice="$75" bundlePrice="$60" />;
