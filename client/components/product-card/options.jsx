import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import FormRadio from 'calypso/components/forms/form-radio';
import InfoPopover from 'calypso/components/info-popover';
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
					{ selectedSlug === 'jetpack_search' && (
						<InfoPopover position="right">
							{ translate(
								'Records are all posts, pages, custom post types, and other types of content indexed by Jetpack Search.'
							) }
						</InfoPopover>
					) }
				</h4>
			) }
			<div className="product-card__options">
				{ options.map( ( option ) => (
					<FormLabel
						key={ `product-option-${ option.slug }` }
						className={ clsx( 'product-card__option', {
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
