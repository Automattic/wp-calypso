/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import Navigation from '../components/navigation';
import { getSelectedSite } from 'state/ui/selectors';

const WPJobManager = ( { site, tab, translate } ) => {
	const mainClassName = 'wp-job-manager__main';

	return (
		<Main className={ mainClassName }>
			<DocumentHead title={ translate( 'WP Job Manager' ) } />
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

export default flowRight(
	connectComponent,
	localize
)( WPJobManager );
