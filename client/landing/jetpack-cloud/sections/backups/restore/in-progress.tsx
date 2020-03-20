/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';
import Gridicon from 'components/gridicon';

interface Props {
	percent: number;
	restoreTimestamp: string;
}

const BackupRestoreInProgress: FunctionComponent< Props > = ( { percent, restoreTimestamp } ) => {
	const translate = useTranslate();

	return (
		<div>
			<h3 className="restore__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar className="restore__in-progress-bar" value={ percent } total={ 100 } />
			<p className="restore__info">
				{ translate(
					'We are restoring your site back to {{strong}}%(restoreTimestamp)s{{/strong}}',
					{
						args: {
							restoreTimestamp,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<div className="restore__in-progress-notice">
				<Gridicon icon="mail" />
				<p>{ translate( 'Check your email' ) }</p>
			</div>
			<p>
				{ translate(
					"Don't want to wait? For your convenience, we'll email you when your site has been fully restored."
				) }
			</p>
		</div>
	);
};

export default BackupRestoreInProgress;
