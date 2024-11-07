import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCake from 'calypso/components/header-cake';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PageShell } from '../components/page-shell';
import { useSort } from '../components/sort-button/use-sort';
import { DeploymentsRunsTable } from '../deployment-run-logs/deployments-run-table';
import { useCodeDeploymentsRunsQuery } from '../deployment-run-logs/use-code-deployment-run-query';
import { indexPage } from '../routes';

import './style.scss';

interface DeploymentRunsDialogProps {
	codeDeploymentId: number;
}

export function DeploymentRunsLogs( { codeDeploymentId }: DeploymentRunsDialogProps ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { data: deployments = [] } = useCodeDeploymentsRunsQuery(
		siteId as number,
		codeDeploymentId
	);

	const { key, direction, handleSortChange } = useSort( 'name' );

	const goToDeployments = () => {
		page( indexPage( siteSlug! ) );
	};

	return (
		<PageShell pageTitle={ __( 'GitHub Deployments' ) }>
			<HeaderCakeBack icon="chevron-left" onClick={ goToDeployments } />
			<div>
				<HeaderCake isCompact>
					<h1>{ __( 'Deployment runs' ) }</h1>
				</HeaderCake>
				<ActionPanel>
					<DeploymentsRunsTable
						deploymentsRuns={ deployments }
						sortKey={ key }
						sortDirection={ direction }
						onSortChange={ handleSortChange }
					/>
				</ActionPanel>
			</div>
		</PageShell>
	);
}
