/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from '../components/navigation';
import { getSelectedSite } from 'state/ui/selectors';

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

const connectComponent = connect(
	( state ) => ( { site: getSelectedSite( state ) || {} } )
);

export default connectComponent( WPJobManager );
