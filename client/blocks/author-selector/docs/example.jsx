import { Card } from '@automattic/components';
import { connect } from 'react-redux';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import AuthorSelector from '../';

function AuthorSelectorExample( { primarySiteId, displayName } ) {
	return (
		<Card>
			<AuthorSelector siteId={ primarySiteId } allowSingleUser popoverPosition="bottom">
				<span>You are { displayName } </span>
			</AuthorSelector>
		</Card>
	);
}

const ConnectedAuthorSelectorExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return {};
	}

	return {
		primarySiteId: user.primary_blog,
		displayName: user.display_name,
	};
} )( AuthorSelectorExample );

ConnectedAuthorSelectorExample.displayName = 'AuthorSelector';

export default ConnectedAuthorSelectorExample;
