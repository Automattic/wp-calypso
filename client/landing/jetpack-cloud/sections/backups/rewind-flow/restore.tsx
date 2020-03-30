/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { defaultRewindConfig, RewindConfig } from './types';
import { useLocalizedMoment } from 'components/localized-moment';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import Gridicon from 'components/gridicon';
import ProgressBar from './progress-bar';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';

interface Props {
	rewindId: string;
	siteId: number;
}

const BackupRestoreFlow: FunctionComponent< Props > = ( { rewindId } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );

	const restoreTimestamp = moment.unix( rewindId ).format( 'LLL' );

	const renderConfirm = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Restore site' ) }</h3>
			<p className="rewind-flow__info">
				{ translate(
					'{{strong}}%(restoreTimestamp)s{{/strong}} is the selected point for your restore. ',
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
			<h4 className="rewind-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice"
				title={ translate( 'This will override and remove all content after this point' ) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<Button
				className="rewind-flow__primary-button"
				primary
				// onClick={ requestDownload }
				disabled={ Object.values( rewindConfig ).every( setting => ! setting ) }
			>
				{ translate( 'Confirm restore' ) }
			</Button>
		</>
	);

	const renderInProgress = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar percent={ 88 } />
			<p className="rewind-flow__info">
				{ translate(
					'We are restoring your site back to {{strong}}%(restoreTimestamp)s{{/strong}}.',
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
			<CheckYourEmail
				message={ translate(
					"Don't want to wait? For your convenience, we'll email you when your site has been fully restored."
				) }
			/>
		</>
	);

	return <div>{ renderInProgress() }</div>;
};

export default BackupRestoreFlow;
