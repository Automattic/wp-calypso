/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MasterbarMinimal from 'layout/masterbar/minimal';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';

const LoggedOutLayout = ( { section, hasSidebar } ) => {
	const sectionClass = section ? ' is-section-' + section : '';
	const classes = classNames( 'wp', sectionClass, {
		'has-no-sidebar': ! hasSidebar
	} );

	return (
		<div className={ classes }>
			<MasterbarMinimal url="/" />
			<div id="content" className="wp-content">
				<GlobalNotices id="notices" notices={ notices.list } />
				<div id="primary" className="wp-primary wp-section" />
				<div id="secondary" className="wp-secondary" />
			</div>
			<div id="tertiary" className="wp-overlay fade-background" />
		</div>
	);
}

LoggedOutLayout.displayName = 'LoggedOutLayout';

export default connect(
	( state ) => {
		const { section, hasSidebar } = state.ui;
		return { section, hasSidebar };
	}
)( LoggedOutLayout );
