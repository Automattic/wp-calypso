/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import Navigation from '../navigation';

const Settings = ( {
	children,
	tab,
	translate
} ) => {
	const mainClassName = 'zoninator__main';

	return (
		<Main className={ mainClassName }>
			<DocumentHead title={ translate( 'WP Zone Manager' ) } />
			<Navigation activeTab={ tab } />
			{ children }
		</Main>
	);
};

Settings.propTypes = {
	tab: PropTypes.string,
};

Settings.defaultProps = {
	tab: '',
};

export default localize( Settings );
