/** @ssr-ready **/

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

const LayoutLoggedOut = ( {
	primary,
	secondary,
	tertiary,
	section,
} ) => {
	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': false, // Logged out has sidebar because
					// the layout expects it to be there
					// but no content is rendered
		'wp-singletree-layout': !! primary,
	} );

	return (
		<div className={ classes }>
			<MasterbarLoggedOut title={ section.title } />
			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
					{ secondary }
				</div>
			</div>
			<div id="tertiary">
				{ tertiary }
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: React.PropTypes.element,
	secondary: React.PropTypes.element,
	tertiary: React.PropTypes.element,
	section: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object,
	] )
};

export default connect(
	state => ( {
		section: state.ui.section
	} )
)( LayoutLoggedOut );
