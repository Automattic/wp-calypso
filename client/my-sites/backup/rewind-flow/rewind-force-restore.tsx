import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ChangeEvent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';

import './style.scss';

interface Props {
	forceRestore: boolean;
	backupCurrentlyInProgress: any;
	onConfigChange: ( config: boolean ) => void;
}

const RewindForceRestore: FunctionComponent< Props > = ( {
	forceRestore,
	backupCurrentlyInProgress,
	onConfigChange,
} ) => {
	const translate = useTranslate();

	const onChange = ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
		onConfigChange( checked );

	return (
		<>
			{ backupCurrentlyInProgress && (
				<>
					<RewindFlowNotice
						gridicon="notice"
						title={ translate( 'There is a backup in progress. Restoring will stop it' ) }
						type={ RewindFlowNoticeLevel.WARNING }
					/>
					<div className="rewind-flow__rewind-config-editor">
						<FormLabel
							className="rewind-flow__rewind-config-editor-label"
							key="forceRestore"
							optional={ false }
							required={ false }
						>
							<FormCheckbox
								checked={ forceRestore }
								className="rewind-flow__rewind-config-editor-checkbox"
								name="forceRestore"
								onChange={ onChange }
							/>
							<span className="rewind-flow__rewind-config-editor-label-text">
								{ translate( 'I want to do the restore anyway' ) }
							</span>
						</FormLabel>
					</div>
				</>
			) }
		</>
	);
};

export default RewindForceRestore;
