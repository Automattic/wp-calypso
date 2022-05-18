import React from 'react';
import ListStep from 'calypso/blocks/import/list';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { ImportWrapper } from '../import';
import { generateStepPath } from '../import/helper';
import './style.scss';

const ImportList: Step = function ImportStep( props ) {
	const { navigation } = props;

	return (
		<ImportWrapper { ...props }>
			<ListStep
				goToStep={ ( step, section ) => navigation.goToStep?.( generateStepPath( step, section ) ) }
			/>
		</ImportWrapper>
	);
};

export default ImportList;
