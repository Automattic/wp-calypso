import { connect } from 'react-redux';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import UserItem from '../index';

const UserItemExample = ( { currentUser } ) => {
	return <UserItem user={ currentUser } />;
};

const ConnectedUserItemExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return {};
	}
	const currentUser = Object.assign( {}, user, { name: user.display_name } );

	return {
		currentUser,
	};
} )( UserItemExample );

ConnectedUserItemExample.displayName = 'UserItem';

export default ConnectedUserItemExample;
