/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import ZoneDetailsForm from '../../forms/zone-details-form';
import { addZone } from '../../../state/zones/actions';

const ZoneCreator = ( {
	saveZone,
	siteId,
	siteSlug,
	translate,
} ) => {
	const save = ( form, data ) => saveZone( siteId, form, data );

	return (
		<div>
			<HeaderCake backHref={ `/extensions/zoninator/${ siteSlug }` }>
				{ translate( 'Add a zone' ) }
			</HeaderCake>

			<ZoneDetailsForm label={ translate( 'New zone' ) } onSubmit={ save } />
		</div>
	);
};

ZoneCreator.propTypes = {
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
};

const connectComponent = connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ saveZone: addZone },
);

export default flowRight(
	connectComponent,
	localize,
)( ZoneCreator );
