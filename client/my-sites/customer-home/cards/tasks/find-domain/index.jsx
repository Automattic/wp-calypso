/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Task from '../task';

const FindDomain = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Look more professional' ) }
			description={ preventWidows(
				translate(
					"Get a custom domain and show the world you're serious. Sites with custom domains look more professional and rank higher in search engine results."
				)
			) }
			actionText={ translate( 'Find a domain' ) }
			actionUrl={ `/domains/add/${ siteSlug }` }
			illustration="/calypso/images/stats/tasks/social-links.svg"
			timing={ 10 }
			taskId="find-domain"
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( FindDomain );
