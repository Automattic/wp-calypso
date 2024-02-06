import { Button } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ConnectRepositoryDialog } from './connect-repository-dialog';

import './style.scss';

export const GitHubEmptyRepositories = () => {
	const [ showDialog, setShowDialog ] = useState( false );
	const handleShowDialog = () => setShowDialog( true );
	const handleHideDialog = () => setShowDialog( false );

	return (
		<>
			<div className="github-deployments-empty-repositories">
				<div>
					<p className="github-deployments-empty-repositories__empty-text">
						<span>{ __( "You don't have any repositories yet." ) }</span>
						<span>{ __( 'Connect or create a new one to start.' ) }</span>
					</p>
				</div>
				<div className="github-deployments-empty-repositories__buttons">
					<Button onClick={ handleShowDialog }>{ __( 'Connect repository' ) }</Button>
					<Button>{ __( 'Create repository' ) }</Button>
				</div>
			</div>
			{ showDialog && <ConnectRepositoryDialog onClose={ handleHideDialog } /> }
		</>
	);
};
