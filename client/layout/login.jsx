/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { getSection } from 'state/ui/selectors';

const LayoutLogin = ( { primary, secondary, section } ) => {
	const classes = {
		[ 'is-group-' + section.group ]: !! get( section, 'group' ),
		[ 'is-section-' + section.name ]: !! get( section, 'name' ),
		'focus-content': true,
		'has-no-sidebar': true,
		'has-no-masterbar': true,
	};

	return (
		<div className={ classNames( 'layout', classes ) }>
			{ /* { masterbar } */ }

			<div id="content" className="layout__content">
				<GlobalNotices
					id="notices"
					notices={ notices.list }
					forcePinned={ 'post' === section.name }
				/>

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

LayoutLogin.displayName = 'LayoutLogin';
LayoutLogin.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	// Connected props
	section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default connect( state => ( {
	section: getSection( state ),
} ) )( LayoutLogin );
