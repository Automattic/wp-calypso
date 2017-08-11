/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
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
	primary: PropTypes.element,
	section: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object,
	] ),
};

export default connect(
	state => ( {
		section: getSection( state )
	} )
)( OauthClientLayout );
