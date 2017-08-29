/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, noop } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const Zone = ( { siteSlug, translate } ) => (
	<div>
		<HeaderCake backHref={ `/extensions/zoninator/${ siteSlug }` } onClick={ noop }>
			{ translate( 'Edit zone' ) }
		</HeaderCake>
	</div>
);

Zone.propTypes = {
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
)( Zone );
