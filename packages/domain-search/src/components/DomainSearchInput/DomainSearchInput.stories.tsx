import { DomainSearchInput } from './DomainSearchInput';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof DomainSearchInput > = {
	title: 'DomainSearch/DomainSearchInput',
	component: DomainSearchInput,
};

export default meta;

export const Default = () => {
	return <DomainSearchInput />;
};
