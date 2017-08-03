/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import { getSection } from 'state/ui/selectors';

const OauthClientLayout = ( {
	primary,
	section,
} ) => {
	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
	} );

	console.error('SUPER DUPER');

	return (
		<div className={ classes }>

			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
			</div>
		</div>
	);
};

OauthClientLayout.displayName = 'OauthClientLayout';
OauthClientLayout.propTypes = {
	primary: React.PropTypes.element,
	section: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object,
	] ),
};

export default connect(
	state => ( {
		section: getSection( state )
	} )
)( OauthClientLayout );
