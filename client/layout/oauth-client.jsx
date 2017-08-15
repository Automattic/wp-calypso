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
import { getOAuth2ClientData } from 'state/login/oauth2/selectors';

const OauthClientLayout = ( {
	primary,
	secondary,
	section,
	oauth2ClientData,
} ) => {
	const hasValidOAuth2ClientData = !! oauth2ClientData;
	const oauthClientName = hasValidOAuth2ClientData && oauth2ClientData.name;

	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
		dops: hasValidOAuth2ClientData,
		[ oauthClientName ]: hasValidOAuth2ClientData,
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
	oauth2ClientData: PropTypes.object,
};

export default connect(
	state => ( {
		section: getSection( state ),
		oauth2ClientData: getOAuth2ClientData( state ),
	} )
)( OauthClientLayout );
