/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingGravatar } from 'state/gravatar/selectors';
import { getGravatarInfo } from 'state/gravatar/actions';

class QueryGravatar extends Component {
	componentWillMount() {
		if ( ! this.props.requesting ) {
			this.props.getGravatarInfo( this.props.email );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( { requesting: isRequestingGravatar( state ) } ),
	{ getGravatarInfo }
)( QueryGravatar );
