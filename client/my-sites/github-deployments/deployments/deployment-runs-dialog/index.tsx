import { Dialog } from '@automattic/components';
import { useSort } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { DeploymentsRunsTable } from 'calypso/my-sites/github-deployments/deployments/deployment-runs-dialog/deployments-run-table';

interface DeploymentRunsDialogProps {
	onClose(): void;
}

export function DeploymentRunsDialog( { onClose }: DeploymentRunsDialogProps ) {
	const { key, direction, handleSortChange } = useSort( 'name' );

	return (
		<Dialog onClose={ onClose }>
			<DeploymentsRunsTable
				deployments={ [] }
				sortKey={ key }
				sortDirection={ direction }
				onSortChange={ handleSortChange }
			/>
		</Dialog>
	);
}
