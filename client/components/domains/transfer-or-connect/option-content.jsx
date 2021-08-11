/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@automattic/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';
import { INCOMING_DOMAIN_TRANSFER } from 'calypso/lib/url/support';

export default function OptionContent( {
	illustration,
	onSelect,
	primary,
	recommended,
	titleText,
	topText,
	learnMoreLink,
	benefits,
	pricing,
} ) {
	const pricingTextClasses = classNames( 'option-content__pricing-text', {
		[ 'pricing-color-green' ]: 'green' === pricing?.color,
	} );

	return (
		<div className="option-content">
			<div className="option-content__illustration">
				{ illustration && <img src={ illustration } alt="" width={ 150 } /> }
			</div>
			<div className="option-content__main">
				<div className="option-content__header">
					<h2>{ titleText }</h2>
					{ recommended && <Badge type="info-green">{ __( 'Recommended' ) }</Badge> }
				</div>
				<div className="option-content__top-text">{ topText }</div>
				<a className="option-content__learn-more" href={ learnMoreLink }>
					{ __( 'Learn more' ) }
				</a>
				{ benefits && (
					<div className="option-content__benefits">
						{ benefits.map( ( benefit, index ) => {
							return (
								<div key={ 'benefit-' + index } className="option-content__benefits-item">
									{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
									<Gridicon size={ 16 } icon="checkmark" />
									<span className="option-content__benefits-item-text">{ benefit }</span>
								</div>
							);
						} ) }
					</div>
				) }
				{ pricing && (
					<div className="option-content__pricing">
						{ pricing?.text && <div className={ pricingTextClasses }>{ pricing.text }</div> }
						{ pricing?.cost && (
							<div className="option-content__pricing-cost">{ pricing.cost }</div>
						) }
					</div>
				) }
			</div>
			<div className="option-content__action">
				{ onSelect && (
					<Button primary={ primary } onClick={ onSelect }>
						{ __( 'Select' ) }
					</Button>
				) }
			</div>
		</div>
	);
}

OptionContent.propTypes = {
	illustration: PropTypes.string.isRequired,
	onSelect: PropTypes.func,
	primary: PropTypes.bool,
	recommended: PropTypes.bool,
	titleText: PropTypes.string.isRequired,
	topText: PropTypes.string.isRequired,
	learnMoreLink: PropTypes.string.isRequired,
	benefits: PropTypes.array,
	pricing: PropTypes.object,
};
