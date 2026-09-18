import { BundleTldChips } from '.';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof BundleTldChips > = {
	title: 'UI/BundleTldChips',
	component: BundleTldChips,
};

export default meta;

export const TwoTlds = () => <BundleTldChips tlds={ [ 'com', 'net' ] } />;

export const ThreeTlds = () => <BundleTldChips tlds={ [ 'com', 'org', 'net' ] } />;

export const LongTlds = () => <BundleTldChips tlds={ [ 'photography', 'international', 'com' ] } />;
