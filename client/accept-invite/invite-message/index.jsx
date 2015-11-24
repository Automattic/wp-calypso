/**
 * External dependencies
 */
import React from 'react'

export default React.createClass( {
	render() {
		if ( this.props.accepted ) {
			return (
				<div>
					{ this.translate( 'You\'re now an author of this site TODO' ) }
				</div>
			);
		}
		return (
			<div>
				{ this.translate( 'You declined to join' ) }
			</div>
		);
	}
} )
