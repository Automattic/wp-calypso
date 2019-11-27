/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import { managePurchase } from 'me/purchases/paths';
import ProductCardAction from './action';
import ProductCardPriceGroup from './price-group';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ProductCard extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] ),
		discountedPrice: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.arrayOf( PropTypes.number ),
		] ),
		fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		isCurrent: PropTypes.bool,
		isIncludedInCurrentPlan: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		purchase: PropTypes.object,
		subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] ),
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	};

	handleManagePurchase( productSlug ) {
		return () => {
			this.props.recordTracksEvent( 'calypso_manage_purchase_click', {
				slug: productSlug,
			} );
		};
	}

	renderActionButton() {
		const { isCurrent, isIncludedInCurrentPlan, purchase, translate } = this.props;

		// Show an action button if the user owns a product or it is part of a plan.
		const displayActionButton = purchase && ( isCurrent || isIncludedInCurrentPlan );

		if ( ! displayActionButton ) {
			return null;
		}

		return (
			<ProductCardAction
				onClick={ this.handleManagePurchase( purchase.productSlug ) }
				href={ managePurchase( purchase.domain, purchase.id ) }
				label={
					isIncludedInCurrentPlan ? translate( 'Manage Plan' ) : translate( 'Manage Product' )
				}
				primary={ false }
			/>
		);
	}

	render() {
		const {
			billingTimeFrame,
			children,
			currencyCode,
			description,
			discountedPrice,
			fullPrice,
			isPlaceholder,
			purchase,
			subtitle,
			title,
		} = this.props;
		const cardClassNames = classNames( 'product-card', {
			'is-placeholder': isPlaceholder,
			'is-purchased': !! purchase,
		} );

		return (
			<Card className={ cardClassNames }>
				<div className="product-card__header">
					{ title && (
						<div className="product-card__header-primary">
							{ purchase && <Gridicon icon="checkmark" size={ 18 } /> }
							<h3 className="product-card__title">{ title }</h3>
						</div>
					) }
					<div className="product-card__header-secondary">
						{ subtitle && <div className="product-card__subtitle">{ subtitle }</div> }
						{ ! purchase && (
							<ProductCardPriceGroup
								billingTimeFrame={ billingTimeFrame }
								currencyCode={ currencyCode }
								discountedPrice={ discountedPrice }
								fullPrice={ fullPrice }
							/>
						) }
					</div>
				</div>
				<div className="product-card__description">
					{ description && <p>{ description }</p> }
					{ this.renderActionButton() }
				</div>
				{ children }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( ProductCard ) );
