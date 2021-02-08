/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import QueryWhatsNewList from 'calypso/components/data/query-whats-new';
// import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWhatsNewList } from 'calypso/state/whats-new/selectors';

function WhatsNew( { list } ) {
	return (
		<>
			<div>
				list obect:
				{ ! list && <QueryWhatsNewList /> }
				{ JSON.stringify( list ) }
			</div>
		</>
	);
}

const mapStateToProps = ( state ) => {
	// const siteId = getSelectedSiteId( state );
	const list = getWhatsNewList( state );

	return {
		list,
	};
};

// export default connect( ( state, ownProps ) => {
// 	return {
// 		list: requestWhatsNewList( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
// 	};
// } )( WhatsNew );

export default connect( mapStateToProps )( WhatsNew );
