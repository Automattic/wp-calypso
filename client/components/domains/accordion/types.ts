import type { ReactNode } from 'react';

export type AccordionProps = {
	children?: ReactNode;
	title: string;
	subtitle?: string | React.ReactNode;
	expanded?: boolean;

	isPlaceholder?: boolean;
};
