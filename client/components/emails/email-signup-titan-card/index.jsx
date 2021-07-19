/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { Button, Card } from '@automattic/components';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import EmailProductPrice from 'calypso/components/emails/email-product-price';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import tip from 'calypso/components/domains/register-domain-step/tip';

/**
 * Style dependencies
 */
import './style.scss';

class EmailSignupTitanCard extends React.Component {
	static propTypes = {
		addButtonTitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
			.isRequired,
		buttonStyles: PropTypes.object,
		email: PropTypes.string,
		extraClasses: PropTypes.string,
		hidePrice: PropTypes.bool,
		onAddButtonClick: PropTypes.func.isRequired,
		onSkipButtonClick: PropTypes.func.isRequired,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		showChevron: PropTypes.bool,
		skipButtonTitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
			.isRequired,
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

	renderCustomDomainName( customDomainName ) {
		return (
			<div className="email-signup-titan-card__title-wrapper">
				<h3 className="email-signup-titan-card__title">
					<div className="email-signup-titan-card__email-title email-signup-titan-card__email-title-name">
						{ this.props.translate( 'youremail@%(domainName)s', {
							args: { domainName: customDomainName },
							comment:
								'This is a sample email address for the user at their domain; %(domainName)s is a domain name, e.g. example.com',
						} ) }
					</div>
				</h3>
			</div>
		);
	}

	renderEmailSuggestion( customDomainName ) {
		return (
			<div className="email-signup-titan-card__suggestion-content">
				{ this.renderCustomDomainName( customDomainName ) }
				{ this.renderPrice() }
			</div>
		);
	}

	renderTip() {
		return (
			<div className="email-signup-titan-card__example-prompt">
				<Icon icon={ tip } size={ 20 } />
				{ this.props.translate( "We'll get your email address set up after checkout." ) }
			</div>
		);
	}

	render() {
		const { extraClasses, isReskinned } = this.props;
		const domainItem = this.props.signupDependencies.domainItem.meta;
		const classes = classNames( 'email-suggestion', 'card', 'is-compact', extraClasses );

		const wrapDivActionContainer = ( contentElement ) =>
			isReskinned ? (
				<div className="email-signup-titan-card__suggestion-action-container">
					{ contentElement }
				</div>
			) : (
				contentElement
			);

		return (
			<>
				<Card className={ classes }>
					{ this.renderEmailSuggestion( domainItem ) }
					{ wrapDivActionContainer(
						<>
							<Button className="email-signup-titan-card__suggestion-action">
								{ this.props.skipButtonTitle }
							</Button>
							<Button className="email-signup-titan-card__suggestion-action is-primary">
								{ this.props.addButtonTitle }
							</Button>
						</>
					) }
					{ this.props.showChevron && (
						<Gridicon
							className="email-signup-titan-card__suggestion-chevron"
							icon="chevron-right"
						/>
					) }
				</Card>
				{ this.renderTip() }
			</>
		);
	}
}

export default connect( ( state ) => {
	const signupDependencies = getSignupDependencyStore( state );
	return {
		signupDependencies,
	};
} )( localize( EmailSignupTitanCard ) );
