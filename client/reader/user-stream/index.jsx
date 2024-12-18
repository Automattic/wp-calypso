// import Gravatar from 'calypso/components/gravatar';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
// import EmptyContent from './empty';

// const emptyContent = () => <EmptyContent />;

function fetchUsers() {
	return wpcom
		.users()
		.wpcom.request( {
			meta: 'flags',
		} )
		.then( () => {
			// console.log( 'Users', users );
		} );
}

const UserStream = () => {
	fetchUsers();
	return <div>user profile stream</div>;
};

export default withDimensions( UserStream );
