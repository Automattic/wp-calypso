/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

interface Props {
	percent: number | null;
}

const RewindFlowProgressBar: FunctionComponent< Props > = ( { percent } ) => {
	const translate = useTranslate();
	const filteredPercent = percent !== null ? percent : 0;
	return (
		<div className="rewind-flow__progress-bar">
			<p>{ translate( '%(filteredPercent)d%% complete', { args: { filteredPercent } } ) }</p>
			<ProgressBar value={ filteredPercent } total={ 100 } />
		</div>
	);
};

export default RewindFlowProgressBar;
