/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSection } from 'state/ui/selectors';

const LayoutJetpack = ( {
	primary,
	secondary,
	tertiary,
	section,
} ) => {
	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Jetpack UI never has a sidebar
		'wp-singletree-layout': !! primary,
	} );

	return (
		<div className={ classes }>
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

LayoutJetpack.displayName = 'LayoutJetpack';
LayoutJetpack.propTypes = {
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
		section: getSection( state )
	} )
)( LayoutJetpack );
