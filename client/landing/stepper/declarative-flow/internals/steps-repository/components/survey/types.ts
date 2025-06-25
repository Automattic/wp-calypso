import React, { PropsWithChildren } from 'react';

export interface SurveyActionsContextType {
	accept: () => void;
	skip: () => void;
}

export interface SurveyProps extends PropsWithChildren {
	name: string;
	onAccept?: () => void;
	onSkip?: () => void;
	className?: string;
	title?: string;
}

export interface TriggerProps {
	asChild?: boolean;
	onClick: () => void;
	as?: React.ElementType;
	children: React.ReactElement;
}
