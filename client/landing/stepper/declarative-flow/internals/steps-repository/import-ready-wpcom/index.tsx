import React from 'react';
import { ReadyAlreadyOnWPCOMStep } from 'calypso/blocks/import/ready';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { generateStepPath } from '../import/helper';
import './style.scss';

const ImportReadyNot: Step = function ImportStep( props ) {
	const { navigation } = props;
	const urlData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	if ( ! urlData ) {
		goToHomeStep();
		return null;
	}

	function goToHomeStep() {
		navigation.goToStep?.( BASE_ROUTE );
	}

	return (
		<ImportWrapper { ...props }>
			<ReadyAlreadyOnWPCOMStep
				urlData={ urlData }
				goToStep={ ( step, section ) => navigation.goToStep?.( generateStepPath( step, section ) ) }
				recordTracksEvent={ recordTracksEvent }
			/>
		</ImportWrapper>
	);
};

export default ImportReadyNot;
