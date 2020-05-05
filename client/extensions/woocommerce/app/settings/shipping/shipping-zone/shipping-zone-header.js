/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getActionList } from 'woocommerce/state/action-list/selectors';

const ShippingZoneHeader = ( {
	zone,
	site,
	onSave,
	onDelete,
	translate,
	isSaving,
	showDelete,
} ) => {
	const currentCrumb =
		zone && isNumber( zone.id ) ? (
			<span>{ translate( 'Edit shipping zone' ) }</span>
		) : (
			<span>{ translate( 'Add new shipping zone' ) }</span>
		);

	const breadcrumbs = [
		<a href={ getLink( '/store/settings/:site/', site ) }> { translate( 'Settings' ) } </a>,
		<a href={ getLink( '/store/settings/shipping/:site/', site ) }>
			{ ' ' }
			{ translate( 'Shipping' ) }{ ' ' }
		</a>,
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs } primaryLabel={ translate( 'Save' ) }>
			{ showDelete && (
				<Button borderless scary onClick={ onDelete } disabled={ isSaving }>
					<Gridicon icon="trash" />
					{ translate( 'Delete' ) }
				</Button>
			) }
			<Button primary onClick={ onSave } busy={ isSaving } disabled={ isSaving }>
				{ translate( 'Save' ) }
			</Button>
		</ActionHeader>
	);
};

ShippingZoneHeader.propTypes = {
	onSave: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default connect( ( state ) => {
	const zone = getCurrentlyEditingShippingZone( state );
	const isRestOfTheWorld = zone && 0 === Number( zone.id );
	return {
		site: getSelectedSite( state ),
		zone,
		showDelete: zone && 'number' === typeof zone.id && ! isRestOfTheWorld,
		isSaving: Boolean( getActionList( state ) ),
	};
} )( localize( ShippingZoneHeader ) );
