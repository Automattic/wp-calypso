import { TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import tip from 'calypso/components/domains/register-domain-step/tip';
import EmailProductPrice from 'calypso/components/emails/email-product-price';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
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
		product: PropTypes.object,
		showChevron: PropTypes.bool,
		skipButtonTitle: PropTypes.node.isRequired,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderEmailSuggestion( customDomainName ) {
		const { product, translate } = this.props;

		return (
			<div className="email-signup-titan-card__suggestion-content">
				<h3 className="email-signup-titan-card__title">
					{ translate( 'youremail@%(domainName)s', {
						args: { domainName: customDomainName },
						comment:
							'This is a sample email address for the user at their domain; %(domainName)s is a domain name, e.g. example.com',
					} ) }
				</h3>
				<EmailProductPrice product={ product } />
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
			hideSkip = false,
			onAddButtonClick,
			onSkipButtonClick,
			showChevron,
			signupDependencies,
			skipButtonTitle,
		} = this.props;
		const domainItem = signupDependencies.domainItem?.meta;
		const classes = clsx( 'email-suggestion', extraClasses );

		return (
			<>
				<QueryProductsList />
				<Card className={ classes } compact>
					{ this.renderEmailSuggestion( domainItem ) }
					<div className="email-signup-titan-card__suggestion-action-container">
						{ ! hideSkip && (
							<Button
								className="email-signup-titan-card__suggestion-action"
								onClick={ onSkipButtonClick }
							>
								{ skipButtonTitle }
							</Button>
						) }
						<Button
							className="email-signup-titan-card__suggestion-action"
							primary
							onClick={ onAddButtonClick }
						>
							{ addButtonTitle }
						</Button>
					</div>
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
	const product = getProductBySlug( state, TITAN_MAIL_YEARLY_SLUG );
	return {
		signupDependencies,
		product,
	};
} )( localize( EmailSignupTitanCard ) );
