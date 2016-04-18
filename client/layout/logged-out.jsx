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
	const classes = classNames( 'wp layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true // Logged-out never has a sidebar
	} );

	return (
		<div className={ classes }>
			<MasterbarLoggedOut/>
			<div id="content" className="wp-content">
				<div id="primary" className="wp-primary wp-section">
					{ primary }
				</div>
				<div id="secondary" className="wp-secondary">
					{ secondary }
				</div>
			</div>
			<div id="tertiary" className="wp-overlay fade-background">
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
	section: React.PropTypes.object
};

export default connect(
	state => ( {
		section: state.ui.section
	} )
)( LayoutLoggedOut );
