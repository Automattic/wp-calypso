/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import getProductLink from 'woocommerce/woocommerce-services/lib/utils/get-product-link';
import { getSite } from 'state/sites/selectors';
import { openItemMove } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const ItemInfo = ( props ) => {
	const { orderId, siteId, site, item, itemIndex, translate } = props;
	const onMoveClick = () => props.openItemMove( orderId, siteId, itemIndex );

	const renderMoveToPackage = () => {
		return (
			<Button className="packages-step__item-move" compact onClick={ onMoveClick }>
				{ translate( 'Move' ) }
			</Button>
		);
	};

	const productLink = item.url ? (
		<a href={ getProductLink( item.product_id, site ) } target="_blank" rel="noopener noreferrer">
			{ item.name }
		</a>
	) : (
		item.name
	);

	return (
		<div key={ itemIndex } className="packages-step__item">
			<div className="packages-step__item-name">
				<span>{ productLink }</span>
				{ item.attributes && <p>{ item.attributes }</p> }
			</div>
			<div>{ renderMoveToPackage() }</div>
		</div>
	);
};

ItemInfo.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	openItemMove: PropTypes.func.isRequired,
};

export default connect(
	( state, { siteId } ) => ( {
		site: getSite( state, siteId ),
	} ),
	( dispatch ) =>
		bindActionCreators(
			{
				openItemMove,
			},
			dispatch
		)
)( localize( ItemInfo ) );
