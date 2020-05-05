/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import InfoPopover from 'components/info-popover';
import ProductCardPriceGroup from './price-group';

const ProductCardOptions = ( {
	handleSelect,
	options,
	optionsLabel,
	selectedSlug,
	forceRadiosEvenIfOnlyOneOption,
} ) => {
	const translate = useTranslate();

	if ( isEmpty( options ) ) {
		return null;
	}

	const hideRadios = options.length === 1 && ! forceRadiosEvenIfOnlyOneOption;

	return (
		<Fragment>
			{ ! hideRadios && optionsLabel && (
				<h4 className="product-card__options-label">
					{ optionsLabel }
					<InfoPopover position="right">
						{ translate(
							'Records are all posts, pages, custom post types, and other types of content indexed by Jetpack Search.'
						) }
					</InfoPopover>
				</h4>
			) }
			<div className="product-card__options">
				{ options.map( ( option ) => (
					<FormLabel
						key={ `product-option-${ option.slug }` }
						className={ classnames( 'product-card__option', {
							'is-selected': option.slug === selectedSlug,
						} ) }
					>
						{ ! hideRadios && (
							<FormRadio
								className="product-card__radio"
								checked={ option.slug === selectedSlug }
								onChange={ () => handleSelect( option.slug ) }
							/>
						) }
						<div className="product-card__option-description">
							{ ! hideRadios && <div className="product-card__option-name">{ option.title }</div> }
							<ProductCardPriceGroup
								billingTimeFrame={ option.billingTimeFrame }
								currencyCode={ option.currencyCode }
								discountedPrice={ option.discountedPrice }
								fullPrice={ option.fullPrice }
							/>
						</div>
					</FormLabel>
				) ) }
			</div>
		</Fragment>
	);
};

ProductCardOptions.propTypes = {
	handleSelect: PropTypes.func,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			billingTimeFrame: PropTypes.string,
			currencyCode: PropTypes.string,
			discountedPrice: PropTypes.oneOfType( [
				PropTypes.number,
				PropTypes.arrayOf( PropTypes.number ),
			] ),
			fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
			slug: PropTypes.string.isRequired,
			title: PropTypes.string,
		} )
	),
	optionsLabel: PropTypes.string,
	selectedSlug: PropTypes.string,
	forceRadiosEvenIfOnlyOneOption: PropTypes.bool,
};

export default ProductCardOptions;
