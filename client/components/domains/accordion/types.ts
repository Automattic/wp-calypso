import type { ReactNode } from 'react';

export type AccordionProps = {
	children: ReactNode;
	title: ReactNode;
	subtitle?: ReactNode;
	expanded?: boolean;
};
