import { ReactNode } from 'react';

export type AccordionProps = {
	children: ReactNode;
	title: string;
	subtitle?: string;
	expanded?: boolean;
};
