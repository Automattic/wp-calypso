/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import EmailProductPrice from 'calypso/components/emails/email-product-price';
import tip from 'calypso/components/domains/register-domain-step/tip';

/**
 * Style dependencies
 */
import './style.scss';

class EmailSignupTitanCard extends React.Component {
	static propTypes = {
		addButtonTitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
			.isRequired,
		skipButtonTitle: PropTypes.oneOfType( [
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
		return (
			<div className="email-suggestion__content">
				<div className="email-registration-suggestion__title-wrapper">
					<h3 className="email-registration-suggestion__title">
						<div className="email-registration-suggestion__email-title">
							<span className="email-registration-suggestion__email-title-name">
								{ this.props.translate( 'youremail@%(domainName)s', {
									args: { domainName: siteUrl },
									comment:
										'This is a sample email address for the user at their domain; %(domainName)s is a domain name, e.g. example.com',
								} ) }
							</span>
						</div>
					</h3>
				</div>
				{ this.renderPrice() }
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
							<Button className="email-suggestion__action">{ this.props.skipButtonTitle }</Button>
							<Button className="email-suggestion__action is-primary">
								{ this.props.addButtonTitle }
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
	}
}

export default localize( EmailSignupTitanCard );
