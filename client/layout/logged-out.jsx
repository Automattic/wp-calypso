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
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import { getSection } from 'state/ui/selectors';
import OauthClientLayout from 'layout/oauth-client';
import { showOAuth2Layout } from 'state/login/oauth2/selectors';

const LayoutLoggedOut = ( {
	primary,
	section,
	redirectUri,
	useOAuth2Layout,
} ) => {
	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
	} );

	if ( useOAuth2Layout ) {
		return (
			<OauthClientLayout primary={ primary } />
		);
	}

	return (
		<div className={ classes }>
			<MasterbarLoggedOut title={ section.title } sectionName={ section.name } redirectUri={ redirectUri } />
			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
				</div>
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	section: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object,
	] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default connect(
	state => ( {
		section: getSection( state ),
		useOAuth2Layout: showOAuth2Layout( state ),
	} )
)( LayoutLoggedOut );
