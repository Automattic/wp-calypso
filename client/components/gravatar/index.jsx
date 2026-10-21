import { Gravatar } from '@automattic/components';
import { connect } from 'react-redux';
import { getUserTempGravatar } from 'calypso/state/gravatar-status/selectors';

export default connect( ( state, ownProps ) => ( {
	tempImage: getUserTempGravatar( state, ownProps?.user?.ID ?? false ),
} ) )( Gravatar );
