import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateFilter } from 'calypso/state/jetpack-agency-dashboard/actions';
import { TypeSelector } from './type-selector';

interface Props {
	translate: typeof translate;
}

const parentTypeKey = 'all_issues';

const IssueTypeSelector: React.FunctionComponent< Props > = ( props ) => {
	const { translate } = props;

	const issueTypes = [
		{
			key: 'backup_failed',
			name: translate( 'Backup failed' ),
		},
		{
			key: 'backup_warning',
			name: translate( 'Backup warning' ),
		},
		{
			key: 'threats_found',
			name: translate( 'Threats found' ),
		},
		{
			key: 'site_down',
			name: translate( 'Site disconnected' ),
		},
		{
			key: 'plugin_updates',
			name: translate( 'Plugin needs updates' ),
		},
	];
	return (
		<TypeSelector
			parentType={ {
				key: parentTypeKey,
				name: translate( 'All issues' ),
			} }
			isNested
			types={ issueTypes }
			typeKey="issueTypes"
			title={ translate( 'Issue Type' ) }
			{ ...props }
		/>
	);
};

const selectIssueType = ( types: any ) => ( dispatch: any ) => {
	if ( types.length ) {
		const eventObj = types.reduce(
			( acc: any, obj: any ) => ( {
				...acc,
				[ `issue_type_${ obj }` ]: true,
			} ),
			{}
		);
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_filter', eventObj ) );
	}
	return dispatch( updateFilter( types ) );
};

export default connect( null, { selectType: selectIssueType } )( localize( IssueTypeSelector ) );
