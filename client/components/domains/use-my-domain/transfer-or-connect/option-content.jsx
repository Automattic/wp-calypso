import { Badge, Button, Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import '../style.scss';

export default function OptionContent( {
	benefits,
	disabled,
	illustration,
	learnMoreLink,
	onSelect,
	onSelectText,
	isPlaceholder,
	pricing,
	primary,
	recommended,
	titleText,
	topText,
} ) {
	const localizeUrl = useLocalizeUrl();
	const pricingTextClasses = clsx( 'option-content__pricing-text', {
		[ 'is-free' ]: pricing?.isFree,
	} );
	const pricingCostClasses = clsx( 'option-content__pricing-cost', {
		[ 'has-sale-price' ]: pricing?.sale,
	} );
	const optionContentClasses = clsx( 'option-content__main', {
		'is-placeholder': isPlaceholder,
	} );

	return isPlaceholder ? (
		<div className="option-content is-placeholder">
			<div className="option-content__illustration" height={ 100 } width={ 150 }></div>
			<div className="option-content__main">
				<div className="option-content__header">
					<h2> </h2>
				</div>
				<div className="option-content__top-text"></div>
				<div className="option-content__learn-more"></div>
			</div>
		</div>
	) : (
		<div className="option-content">
			<div className="option-content__illustration">
				{ illustration && <img src={ illustration } alt="" width={ 150 } /> }
			</div>
			<div className={ optionContentClasses }>
				<div className="option-content__header">
					<h2>{ titleText }</h2>
					{ recommended && <Badge type="info-green">{ __( 'Recommended' ) }</Badge> }
				</div>
				<div className="option-content__top-text">{ topText }</div>
				{ learnMoreLink && (
					<a
						className="option-content__learn-more"
						target="_blank"
						href={ localizeUrl( learnMoreLink ) }
						rel="noopener noreferrer"
					>
						{ __( 'Learn more' ) }
					</a>
				) }
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
						{ pricing?.sale && (
							<div className="option-content__pricing-cost is-sale-price">
								{ pricing.sale }
								<Badge type="warning">{ __( 'Sale' ) }</Badge>
							</div>
						) }
						{ pricing?.cost && <div className={ pricingCostClasses }>{ pricing.cost }</div> }
					</div>
				) }
			</div>
			<div className="option-content__action">
				{ onSelect && (
					<Button primary={ primary } disabled={ disabled } onClick={ onSelect } busy={ disabled }>
						{ onSelectText ?? __( 'Select' ) }
					</Button>
				) }
			</div>
		</div>
	);
}

OptionContent.propTypes = {
	benefits: PropTypes.array,
	disabled: PropTypes.bool,
	illustration: PropTypes.string.isRequired,
	learnMoreLink: PropTypes.string,
	onSelect: PropTypes.func,
	onSelectText: PropTypes.string,
	pricing: PropTypes.object,
	primary: PropTypes.bool,
	recommended: PropTypes.bool,
	titleText: PropTypes.string.isRequired,
	topText: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ).isRequired,
};
