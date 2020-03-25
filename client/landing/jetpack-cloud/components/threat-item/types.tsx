/**
 * External dependencies
 */
import { ReactNode } from 'react';

export type ThreatAction = 'fix' | 'ignore';

export type Threat = {
	id: number;
	title: string;
	details: string;
	action: null | 'fixed' | 'ignored';
	detectionDate: string;
	actionDate: string;
	description: {
		title: string;
		problem: string | ReactNode;
		fix: string | ReactNode;
		details: string | ReactNode;
	};
};
