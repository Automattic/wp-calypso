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

const LayoutLoggedOut = ( {
	primary,
	secondary,
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
			<MasterbarLoggedOut title={ section.title } sectionName={ section.name } />
			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
					{ secondary }
				</div>
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: React.PropTypes.element,
	secondary: React.PropTypes.element,
	section: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object,
	] )
};

export default connect(
	state => ( {
		section: getSection( state )
	} )
)( LayoutLoggedOut );
