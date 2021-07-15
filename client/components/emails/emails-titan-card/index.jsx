/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import moment from 'moment';

/**
 * Internal dependencies
 */
import EmailProductPrice from 'calypso/components/emails/email-product-price';
import { Button } from '@automattic/components';
import tip from '../../domains/register-domain-step/tip';

/**
 * Style dependencies
 */
import './style.scss';
import { Icon } from '@wordpress/icons';

class EmailTitanCard extends React.Component {
	static propTypes = {
		addButtonContent: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
			.isRequired,
		skipButtonContent: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.element,
			PropTypes.node,
		] ).isRequired,
		buttonStyles: PropTypes.object,
		extraClasses: PropTypes.string,
		onAddButtonClick: PropTypes.func.isRequired,
		onSkipButtonClick: PropTypes.func.isRequired,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		email: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderPrice() {
		const { price, salePrice } = this.props;

		return (
			<EmailProductPrice
				price={ price }
				salePrice={ salePrice }
				isSignupStep={ true }
				showStrikedOutPrice={ false }
			/>
		);
	}

	renderTip() {
		return (
			<div className="register-email-step__example-prompt">
				<Icon icon={ tip } size={ 20 } />
				{ this.props.translate( "We'll get your email address set up after checkout." ) }
			</div>
		);
	}

	renderEmailSuggestion( siteUrl ) {
		const THREE_MONTHS_AHEAD = Date.now() + 24 * 3600 * 90 * 1000;
		const localeSlug = getLocaleSlug();
		const momentTime = moment( THREE_MONTHS_AHEAD ).locale( localeSlug );
		return (
			<div className="email-suggestion__content">
				<div className="email-registration-suggestion__title-wrapper">
					<h3 className="email-registration-suggestion__title">
						<div className="email-registration-suggestion__email-title">
							<span className="email-registration-suggestion__email-title-name">
								{ ' ' }
								{ this.props.translate( 'youremail' ) }@{ siteUrl }
							</span>
						</div>
					</h3>
				</div>
				<div className="email-product-price is-free-email email-product-price__email-step-signup-flow">
					<div className="email-product-price__free-text">
						<span className="email-product-price__free-price">Free for the first three months</span>
					</div>
					<div className="email-product-price__price">
						<span>$3.5/per month starting { momentTime.format( 'LL' ) }</span>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { extraClasses, isReskinned, siteUrl } = this.props;
		const classes = classNames( 'email-suggestion', 'card', 'is-compact', extraClasses );

		const wrapDivActionContainer = ( contentElement ) =>
			isReskinned ? (
				<div className="email-suggestion__action-container">{ contentElement }</div>
			) : (
				contentElement
			);

		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/interactive-supports-focus */
		return (
			<>
				<div
					className={ classes }
					data-tracks-button-click-source={ this.props.tracksButtonClickSource }
					role="button"
					data-e2e-email={ this.props.email }
				>
					{ this.renderEmailSuggestion( siteUrl ) }
					{ wrapDivActionContainer(
						<>
							<Button className="email-suggestion__action">{ this.props.skipButtonContent }</Button>
							<Button className="email-suggestion__action is-primary">
								{ this.props.addButtonContent }
							</Button>
						</>
					) }
					{ this.props.showChevron && (
						<Gridicon className="email-suggestion__chevron" icon="chevron-right" />
					) }
				</div>
				{ this.renderTip() }
			</>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
		/* eslint-enable jsx-a11y/interactive-supports-focus */
	}
}

EmailTitanCard.Placeholder = function () {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="email-suggestion card is-compact is-placeholder is-clickable">
			<div className="email-suggestion__content">
				<div />
			</div>
			<div className="email-suggestion__action" />
			<Gridicon className="email-suggestion__chevron" icon="chevron-right" />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default localize( EmailTitanCard );
