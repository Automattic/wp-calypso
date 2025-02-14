import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ProgressBar from '../progress-bar';
import CheckYourEmail from '../rewind-flow-notice/check-your-email';

interface Props {
	backupDisplayDate: string;
	status: string | null;
	message: string;
	currentEntry: string;
	percent: number;
}

const RestoreInProgress: FunctionComponent< Props > = ( {
	backupDisplayDate,
	status,
	message,
	currentEntry,
	percent,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar
				isReady={ 'running' === status }
				initializationMessage={ translate( 'Initializing the restore process' ) }
				message={ message }
				entry={ currentEntry }
				percent={ percent }
			/>
			<p className="rewind-flow__info">
				{ translate(
					'We are restoring your site back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<CheckYourEmail
				message={ translate(
					"Don't want to wait? For your convenience, we'll email you when your site has been fully restored."
				) }
			/>
		</>
	);
};

export default RestoreInProgress;
