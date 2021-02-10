/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import QueryWhatsNewList from 'calypso/components/data/query-whats-new';
import { getWhatsNewList } from 'calypso/state/whats-new/selectors';
function WhatsNew( { list, isListReady } ) {
	return (
		<>
			<div>
				<QueryWhatsNewList />
				{ JSON.stringify( list ) }
				{ isListReady &&
					list.map( ( item ) => (
						<p>
							{ item.appVersionName }: { item.detailsUrl }
						</p>
					) ) }
			</div>
		</>
	);
}

WhatsNew.propTypes = {
	list: PropTypes.object,
	isListReady: PropTypes.bool,
};

const mapStateToProps = ( state ) => {
	const list = getWhatsNewList( state ).announcements;
	// const isListReady = Object.keys( list ).length !== 0;
	const isListReady = list !== null;

	return {
		list,
		isListReady,
	};
};

export default connect( mapStateToProps )( WhatsNew );
