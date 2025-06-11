import { Gravatar } from '@automattic/components';
import { Hovercards } from '@gravatar-com/hovercards/react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { getUserTempGravatar } from 'calypso/state/gravatar-status/selectors';
import '@gravatar-com/hovercards/dist/style.css';

const ConnectedGravatar = connect( ( state, ownProps ) => ( {
	tempImage: getUserTempGravatar( state, get( ownProps, 'user.ID', false ) ),
} ) )( Gravatar );

export default function GravatarWithHovercards( { showHovercards = false, ...props } ) {
	if ( ! showHovercards ) {
		return <ConnectedGravatar { ...props } />;
	}

	return (
		<Hovercards>
			<ConnectedGravatar { ...props } />
		</Hovercards>
	);
}
