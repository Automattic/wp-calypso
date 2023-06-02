import { Gravatar } from '@automattic/components';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { getUserTempGravatar } from 'calypso/state/gravatar-status/selectors';

export default connect( ( state, ownProps ) => ( {
	tempImage: getUserTempGravatar( state, get( ownProps, 'user.ID', false ) ),
} ) )( Gravatar );
