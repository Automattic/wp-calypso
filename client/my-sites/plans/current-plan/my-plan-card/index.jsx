/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Card, ProductIcon } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const MyPlanCard = ( { action, isError, isPlaceholder, details, product, tagline, title } ) => {
	const cardClassNames = classNames( 'my-plan-card', {
		'is-placeholder': isPlaceholder,
		'has-action-only': action && ! details && ! isPlaceholder,
	} );
	const detailsClassNames = classNames( 'my-plan-card__details', { 'is-error': isError } );

	return (
		<Card className={ cardClassNames } compact data-e2e-product-slug={ product }>
			<div className="my-plan-card__primary">
				<div className="my-plan-card__icon">
					{ ! isPlaceholder && product && <ProductIcon slug={ product } /> }
				</div>
				<div className="my-plan-card__header">
					{ title && <h2 className="my-plan-card__title">{ title }</h2> }
					{ tagline && <p className="my-plan-card__tagline">{ tagline }</p> }
				</div>
			</div>
			{ ( details || action || isPlaceholder ) && (
				<div className="my-plan-card__secondary">
					<div className={ detailsClassNames }>{ isPlaceholder ? null : details }</div>
					<div className="my-plan-card__action">{ isPlaceholder ? null : action }</div>
				</div>
			) }
		</Card>
	);
};

MyPlanCard.propTypes = {
	action: PropTypes.oneOfType( [ PropTypes.node, PropTypes.element ] ),
	isError: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	details: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
	product: PropTypes.string,
	tagline: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node, PropTypes.element ] ),
};

export default MyPlanCard;
