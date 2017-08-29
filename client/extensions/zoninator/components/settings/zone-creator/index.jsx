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
import { settingsPath } from '../../../app/util';

const ZoneCreator = ( {
	saveZone,
	siteId,
	siteSlug,
	translate,
} ) => (
	<div>
		<HeaderCake backHref={ `${ settingsPath }/${ siteSlug }` }>
			{ translate( 'Add a zone' ) }
		</HeaderCake>

		<ZoneDetailsForm label={ translate( 'New zone' ) } siteId={ siteId } onSubmit={ saveZone } />
	</div>
);

ZoneCreator.propTypes = {
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	saveZone: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
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
