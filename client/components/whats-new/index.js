/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card } from '@automattic/components';
/**
 * Internal Dependencies
 */
import QueryWhatsNewList from 'calypso/components/data/query-whats-new';
import { getWhatsNewList } from 'calypso/state/whats-new/selectors';
function WhatsNew( { list, isListReady } ) {
	return (
		<Card>
			<div>
				{ ! isListReady && <QueryWhatsNewList /> }
				{ isListReady &&
					list.announcements.map( ( item ) => (
						<>
							<p>{ item.title }</p>
							<p>{ item.subtitle }</p>
							<p>
								<a href={ item.detailsUrl }>Learn more</a>
							</p>
						</>
					) ) }
			</div>
		</Card>
	);
}

WhatsNew.propTypes = {
	list: PropTypes.object,
	isListReady: PropTypes.bool,
};

const mapStateToProps = ( state ) => {
	const list = getWhatsNewList( state );
	const isListReady = Object.keys( list ).length !== 0;

	return {
		list,
		isListReady,
	};
};

export default connect( mapStateToProps )( WhatsNew );
