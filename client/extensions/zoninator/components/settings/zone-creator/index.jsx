/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const ZoneCreator = ( { siteSlug, translate } ) => {
	const handleGoBack = () => {
		page( `/extensions/zoninator/${ siteSlug }` );
	};

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Add a zone' ) }
			</HeaderCake>
		</div>
	);
};

ZoneCreator.propTypes = {
	siteSlug: PropTypes.string,
};

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( ZoneCreator );
