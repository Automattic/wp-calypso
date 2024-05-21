import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import ActionPanel from 'calypso/components/action-panel/index';
import HeaderCake from 'calypso/components/header-cake/index';
import { PageShell } from 'calypso/my-sites/github-deployments/components/page-shell';
import { useSort } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { DeploymentsRunsTable } from 'calypso/my-sites/github-deployments/deployment-run-logs/deployments-run-table';
import { useCodeDeploymentsRunsQuery } from 'calypso/my-sites/github-deployments/deployment-run-logs/use-code-deployment-run-query';
import { indexPage } from 'calypso/my-sites/github-deployments/routes';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';

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
			<HeaderCake onClick={ goToDeployments } isCompact backIcon="chevron-left">
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
		</PageShell>
	);
}
