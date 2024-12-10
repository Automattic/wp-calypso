import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import './style.scss';

interface Props {
	onClick: ( option: string ) => void;
}

export const DIYOption: FC< Props > = ( { onClick } ) => {
	const translate = useTranslate();

	return (
		<Button
			plain
			className="how-to-migrate__experiment-diy"
			onClick={ () => onClick( HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) }
		>
			{ translate( "I'll do it myself" ) }
		</Button>
	);
};
