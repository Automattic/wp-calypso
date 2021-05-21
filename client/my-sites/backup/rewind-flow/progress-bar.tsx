/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	isReady: boolean;
	percent: number | null;
	initializationMessage: TranslateResult;
	message?: string;
	entry?: string;
}

const RewindFlowProgressBar: FunctionComponent< Props > = ( {
	isReady,
	percent,
	initializationMessage,
	message,
	entry,
} ) => {
	const translate = useTranslate();
	const filteredPercent = ( Number.isFinite( percent ) ? percent : 0 ) as number;

	return (
		<div className="rewind-flow__progress-bar">
			<div className="rewind-flow__progress-bar-header">
				<p className="rewind-flow__progress-bar-message">
					{ isReady ? message : initializationMessage }
				</p>
				<p className="rewind-flow__progress-bar-percent">
					{ translate( '%(filteredPercent)d%% complete', { args: { filteredPercent } } ) }
				</p>
			</div>
			<ProgressBar value={ filteredPercent } total={ 100 } />
			<p className="rewind-flow__progress-bar-entry">
				{ isReady &&
					entry &&
					translate( 'Currently restoring: %s', {
						args: entry,
						comment: '%s entry is the file, table, etc. being restored',
					} ) }
			</p>
		</div>
	);
};

export default RewindFlowProgressBar;
