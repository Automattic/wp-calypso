import React from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { ImportWrapper } from '../import';
import './style.scss';

const ImportLight: Step = function ImportStep( props ) {
	return (
		<ImportWrapper { ...props }>
			<div>Import Light</div>
		</ImportWrapper>
	);
};

export default ImportLight;
