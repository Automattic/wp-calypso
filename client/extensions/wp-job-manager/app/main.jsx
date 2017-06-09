/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from '../components/navigation';

const WPJobManager = ( { site, tab } ) => {
	const mainClassName = 'wp-job-manager__main';

	return (
		<Main className={ mainClassName }>
			<Navigation activeTab={ tab } site={ site } />
		</Main>
	);
};

WPJobManager.propTypes = {
	site: PropTypes.object,
	tab: PropTypes.string,
};

WPJobManager.defaultProps = {
	tab: '',
};

export default WPJobManager;
