/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { getCurrentUser } from 'state/current-user/selectors';

const GravatarExample = React.createClass( {

	displayName: 'Gravatar',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/gravatar">Gravatar</a>
				</h2>
				<Gravatar user={ this.props.currentUser } size={ 96 } />
			</div>
		);
	}
} );

export default connect( ( state ) => {
	return {
		currentUser: getCurrentUser( state )
	};
} )( GravatarExample );
