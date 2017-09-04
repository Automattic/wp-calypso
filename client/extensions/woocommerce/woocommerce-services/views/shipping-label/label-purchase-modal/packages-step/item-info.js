/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { openItemMove, removeItem } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const ItemInfo = ( props ) => {
	const { item, itemIndex } = props;
	const onMoveClick = () => props.openItemMove( itemIndex );

	const renderMoveToPackage = () => {
		return (
			<Button className="packages-step__item-move" compact onClick={ onMoveClick }>
				{ __( 'Move' ) }
			</Button>
		);
	};

	return (
		<div key={ itemIndex } className="packages-step__item">
			<div className="packages-step__item-name">
					<span>
						{ item.url
							? <a href={ item.url } target="_blank" rel="noopener noreferrer">{ item.name }</a>
							: item.name
						}
					</span>
				{ item.attributes && <p>{ item.attributes }</p> }
			</div>
			<div>
				{ renderMoveToPackage() }
			</div>
		</div>
	);
};

ItemInfo.propTypes = {
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	openItemMove: PropTypes.func.isRequired,
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		openItemMove,
		removeItem,
	}, dispatch );
};

export default connect( null, mapDispatchToProps )( ItemInfo );
