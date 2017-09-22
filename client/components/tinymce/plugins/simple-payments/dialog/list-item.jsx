/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ProductImage from './product-image';
import CompactCard from 'components/card/compact';
import EllipsisMenu from 'components/ellipsis-menu';
import FormRadio from 'components/forms/form-radio';
import PopoverMenuItem from 'components/popover/menu-item';
import { getCurrencyObject } from 'lib/format-currency';

class ProductListItem extends Component {
	static propTypes = {
		onSelectedChange: PropTypes.func,
		onEditClick: PropTypes.func,
		onTrashClick: PropTypes.func,
	};

	static defaultProps = {
		onSelectedChange: noop,
		onEditClick: noop,
		onTrashClick: noop,
	};

	handleRadioChange = () => this.props.onSelectedChange( this.props.paymentId );
	handleEditClick = () => this.props.onEditClick( this.props.paymentId );
	handleTrashClick = () => this.props.onTrashClick( this.props.paymentId );

	formatPrice( price, currency = 'USD' ) {
		const { integer, fraction } = getCurrencyObject( price, currency );
		return `${ integer }${ fraction } ${ currency }`;
	}

	render() {
		const {
			siteId,
			paymentId,
			title,
			price,
			currency,
			featuredImageId,
			isSelected,
			translate,
		} = this.props;
		const radioId = `simple-payments-list-item-radio-${ paymentId }`;

		return (
			<CompactCard className="editor-simple-payments-modal__list-item">
				<FormRadio
					name="selection"
					id={ radioId }
					value={ paymentId }
					checked={ isSelected }
					onChange={ this.handleRadioChange }
				/>
				<label className="editor-simple-payments-modal__list-label" htmlFor={ radioId }>
					<div className="editor-simple-payments-modal__list-name">
						{ title }
					</div>
					<div>
						{ this.formatPrice( price, currency ) }
					</div>
				</label>
				<ProductImage siteId={ siteId } imageId={ featuredImageId } />
				<EllipsisMenu
					className="editor-simple-payments-modal__list-menu"
					popoverClassName="is-dialog-visible"
					position="bottom left"
				>
					<PopoverMenuItem icon="pencil" onClick={ this.handleEditClick }>
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem icon="trash" onClick={ this.handleTrashClick }>
						{ translate( 'Trash' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</CompactCard>
		);
	}
}

export default localize( ProductListItem );
