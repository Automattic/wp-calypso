import { Button } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/use-code-deployments-query';
import { DeploymentsListItem } from './deployments-list-item';
import { SortOption } from './index';

interface DeploymentsListProps {
	deployments: CodeDeploymentData[];
	sortKey: SortOption;
	onSortChange( sort: SortOption ): void;
}

type SortPair = [ SortOption, SortOption ];

const nameSorts: SortPair = [ 'name_asc', 'name_desc' ];
const dateSorts: SortPair = [ 'date_asc', 'date_desc' ];
const statusSorts: SortPair = [ 'status_asc', 'status_desc' ];
const durationSorts: SortPair = [ 'duration_asc', 'duration_desc' ];

export const DeploymentsList = ( { deployments, sortKey, onSortChange }: DeploymentsListProps ) => {
	function getSortIcon( pair: SortPair ) {
		if ( sortKey === pair[ 0 ] ) {
			return <Icon size={ 16 } icon={ chevronDown } />;
		} else if ( sortKey === pair[ 1 ] ) {
			return <Icon size={ 16 } icon={ chevronUp } />;
		}
	}

	function handleChangeSort( pair: SortPair ) {
		if ( sortKey === pair[ 0 ] ) {
			return pair[ 1 ];
		}
		return pair[ 0 ];
	}

	return (
		<table>
			<thead>
				<tr>
					<th>
						<Button plain onClick={ () => onSortChange( handleChangeSort( nameSorts ) ) }>
							<span>{ __( 'Repository' ) }</span>
							{ getSortIcon( nameSorts ) }
						</Button>
					</th>
					<th>
						<span>{ __( 'Last commit' ) }</span>
					</th>
					<th>
						<Button plain onClick={ () => onSortChange( handleChangeSort( statusSorts ) ) }>
							<span>{ __( 'Status ' ) }</span>
							{ getSortIcon( statusSorts ) }
						</Button>
					</th>
					<th>
						<Button plain onClick={ () => onSortChange( handleChangeSort( dateSorts ) ) }>
							<span>{ __( 'Date ' ) }</span>
							{ getSortIcon( dateSorts ) }
						</Button>
					</th>
					<th>
						<Button plain onClick={ () => onSortChange( handleChangeSort( durationSorts ) ) }>
							<span>{ __( 'Duration ' ) }</span>
							{ getSortIcon( durationSorts ) }
						</Button>
					</th>
					<th> </th>
				</tr>
			</thead>
			<tbody>
				{ deployments.map( ( deployment, index ) => (
					<DeploymentsListItem key={ index } deployment={ deployment } />
				) ) }
			</tbody>
		</table>
	);
};
