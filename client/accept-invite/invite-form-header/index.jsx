/**
 * External dependencies
 */
import React from 'react'

export default React.createClass( {
	displayName: 'InviteFormHeader',

	render() {
		return (
			<div className="invite-form-header">
				<h3 className="invite-form-header__title">
					{ this.props.title }
				</h3>
				{ this.props.explanation &&
					<p className="invite-form-header__explanation">
						{ this.props.explanation }
					</p>
				}
			</div>
		)
	}
} );
