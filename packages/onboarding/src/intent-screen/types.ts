import { TranslateResult } from 'i18n-calypso';
import React from 'react';

export interface SelectItem< T > {
	key: string;
	title: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	value: T;
	actionText: TranslateResult;
	hidden?: boolean;
}

export interface SelectAltItem< T > {
	show: boolean;
	key: string;
	description: TranslateResult;
	value: T;
	actionText: TranslateResult;
	disable: boolean;
	disableText: TranslateResult;
}
