/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from './components/navigation';

const WPSuperCache = ( { tab } ) => (
	<Main className="wp-super-cache__main">
		<Navigation activeTab={ tab } />
	</Main>
);

WPSuperCache.propTypes = {
	tab: React.PropTypes.string
};

WPSuperCache.defaultProps = {
	tab: ''
};

export default WPSuperCache;
