import React, { PropsWithChildren } from 'react';

export interface SurveyContextType {
	isOpen: boolean;
}
export interface SurveyActionsContextType {
	accept: () => void;
	skip: () => void;
}

export interface SurveyProps extends PropsWithChildren {
	name: string;
	onAccept?: () => void;
	onSkip?: () => void;
	isOpen?: boolean;
	className?: string;
}

export interface TriggerProps {
	asChild?: boolean;
	onClick: () => void;
	children: React.ReactElement;
	as?: React.ElementType;
}
