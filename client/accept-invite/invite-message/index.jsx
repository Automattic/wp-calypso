/**
 * External dependencies
 */
import React from 'react'

export default React.createClass( {
	render() {
		if ( this.props.accepted ) {
			return (
				<div>
					<h3>
						{ this.translate( 'You\'re now an author of: %(siteTitle)s', { args: { siteTitle: this.props.siteTitle } } ) }
					</h3>
				</div>
			);
		}
		return (
			<div>
				<h3>
					{ this.translate( 'You declined to join: %(siteTitle)s', { args: { siteTitle: this.props.siteTitle } } ) }
				</h3>
			</div>
		);
	}
} )
