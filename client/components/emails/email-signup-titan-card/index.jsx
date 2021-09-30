import { TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import tip from 'calypso/components/domains/register-domain-step/tip';
import EmailProductPrice from 'calypso/components/emails/email-product-price';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';

import './style.scss';

class EmailSignupTitanCard extends Component {
	static propTypes = {
		addButtonTitle: PropTypes.node.isRequired,
		buttonStyles: PropTypes.object,
		email: PropTypes.string,
		extraClasses: PropTypes.string,
		hidePrice: PropTypes.bool,
		onAddButtonClick: PropTypes.func.isRequired,
		onSkipButtonClick: PropTypes.func.isRequired,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		showChevron: PropTypes.bool,
		skipButtonTitle: PropTypes.node.isRequired,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderEmailSuggestion( customDomainName ) {
		const { salePrice, titanMonthlyRenewalCost, translate } = this.props;

		return (
			<div className="email-signup-titan-card__suggestion-content">
				<h3 className="email-signup-titan-card__title">
					{ translate( 'youremail@%(domainName)s', {
						args: { domainName: customDomainName },
						comment:
							'This is a sample email address for the user at their domain; %(domainName)s is a domain name, e.g. example.com',
					} ) }
				</h3>
				<EmailProductPrice
					price={ titanMonthlyRenewalCost }
					salePrice={ salePrice }
					isSignupStep={ true }
					showStrikedOutPrice={ false }
				/>
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
		const {
			addButtonTitle,
			extraClasses,
			isReskinned,
			onAddButtonClick,
			onSkipButtonClick,
			showChevron,
			signupDependencies,
			skipButtonTitle,
		} = this.props;
		const domainItem = signupDependencies.domainItem?.meta;
		const classes = classNames( 'email-suggestion', extraClasses );

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
				<Card className={ classes } compact>
					{ this.renderEmailSuggestion( domainItem ) }
					{ wrapDivActionContainer(
						<>
							<Button
								className="email-signup-titan-card__suggestion-action"
								onClick={ onSkipButtonClick }
							>
								{ skipButtonTitle }
							</Button>
							<Button
								className="email-signup-titan-card__suggestion-action"
								primary
								onClick={ onAddButtonClick }
							>
								{ addButtonTitle }
							</Button>
						</>
					) }
					{ showChevron && (
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
	const titanMonthlyRenewalCost = getProductDisplayCost( state, TITAN_MAIL_MONTHLY_SLUG );
	return {
		signupDependencies,
		titanMonthlyRenewalCost,
	};
} )( localize( EmailSignupTitanCard ) );
