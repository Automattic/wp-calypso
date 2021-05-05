/**
 * External dependencies
 */
import React from 'react';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';

/**
 * Type dependencies
 */
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	className?: string;
	label?: TranslateResult;
	primary?: boolean;
	siteId: number | null;
	urlQueryArgs: QueryArgs;
}

const JetpackFreeCardButton: React.FC< Props > = ( {
	className,
	label,
	primary = false,
	siteId,
	urlQueryArgs,
} ) => {
	const translate = useTranslate();
	const props = useJetpackFreeButtonProps( siteId, urlQueryArgs );

	return (
		<Button primary={ primary } className={ className } { ...props }>
			{ label || translate( 'Start for free' ) }
		</Button>
	);
};

export default JetpackFreeCardButton;
