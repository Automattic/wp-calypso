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

const DeprecateEditor = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'The Block Editor is coming' ) }
			description={ preventWidows(
				translate( 'Try the Block Editor now before it is enabled for everyone on May 22.' )
			) }
			actionText={ translate( 'Try it now' ) }
			actionUrl={ `/block-editor/post/${ siteSlug }` }
			illustration="/calypso/images/illustrations/gutenberg-mini.svg"
			timing={ 5 }
			taskId="deprecate-editor"
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( DeprecateEditor );
