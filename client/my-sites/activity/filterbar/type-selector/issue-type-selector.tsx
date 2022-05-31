import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { updateFilter } from 'calypso/state/jetpack-agency-dashboard/actions';
import { TypeSelector } from './type-selector';

interface Props {
	translate: typeof translate;
}
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
	];
	return <TypeSelector types={ issueTypes } title={ translate( 'Issue Type' ) } { ...props } />;
};

const selectIssueType = ( types: any ) => ( dispatch: any ) => {
	return dispatch( updateFilter( types ) );
};

export default connect( null, { selectType: selectIssueType } )( localize( IssueTypeSelector ) );
