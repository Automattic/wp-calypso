/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import classnames from 'classnames';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import log from 'calypso/lib/catch-js-errors/log';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import ProductImage from './product-image';
import { CompactCard } from '@automattic/components';
import { DEFAULT_CURRENCY } from 'calypso/lib/simple-payments/constants';

/* eslint-disable wpcalypso/jsx-classname-namespace */

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

	formatPrice( price, currency = DEFAULT_CURRENCY ) {
		if ( isNaN( price ) ) {
			log( 'Simple Payments: invalid price value', {
				siteId: this.props.siteId,
				paymentId: this.props.paymentId,
				price,
			} );
			return `---- ${ currency }`;
		}
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
		const labelClasses = classnames( {
			'editor-simple-payments-modal__list-label': true,
			'is-error': isNaN( price ),
		} );

		return (
			<CompactCard className="editor-simple-payments-modal__list-item">
				<FormRadio
					name="selection"
					id={ radioId }
					value={ paymentId }
					checked={ isSelected }
					onChange={ this.handleRadioChange }
				/>
				<FormLabel className={ labelClasses } htmlFor={ radioId }>
					<div className="editor-simple-payments-modal__list-name">{ title }</div>
					<div>{ this.formatPrice( price, currency ) }</div>
				</FormLabel>
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
