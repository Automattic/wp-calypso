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
	message?: string;
	entry?: string;
}

const RewindFlowProgressBar: FunctionComponent< Props > = ( { percent, message, entry } ) => {
	const translate = useTranslate();
	const filteredPercent = percent !== null ? percent : 0;
	return (
		<div className="rewind-flow__progress-bar">
			<div className="rewind-flow__progress-bar-header">
				<p className="rewind-flow__progress-bar-message">{ message }</p>
				<p className="rewind-flow__progress-bar-percent">
					{ translate( '%(filteredPercent)d%% complete', { args: { filteredPercent } } ) }
				</p>
			</div>
			<ProgressBar value={ filteredPercent } total={ 100 } />
			{ entry && (
				<p className="rewind-flow__progress-bar-entry">
					{ translate( 'Currently restoring: %s', {
						args: entry,
						comment: '%s entry is the file, table, etc. being restored',
					} ) }
				</p>
			) }
		</div>
	);
};

export default RewindFlowProgressBar;
