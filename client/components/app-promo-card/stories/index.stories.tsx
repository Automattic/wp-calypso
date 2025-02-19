import { AppPromoCard } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof AppPromoCard > = {
	title: 'client/components/App Promo Card',
	component: AppPromoCard,
};
export default meta;

type Story = StoryObj< typeof AppPromoCard >;

export const Default: Story = {};
