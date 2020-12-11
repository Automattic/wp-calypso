/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

export const ButtonLabel: React.FC = () => {
	const translate = useTranslate();

	return <>{ translate( 'CLICK!' ) }</>;
};
