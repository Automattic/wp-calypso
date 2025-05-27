import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DomainProductPrice from 'calypso/components/domains/domain-product-price';

import './style.scss';

class DomainSuggestion extends Component {
	static propTypes = {
		buttonContent: PropTypes.node.isRequired,
		buttonStyles: PropTypes.object,
		extraClasses: PropTypes.string,
		onButtonClick: PropTypes.func.isRequired,
		premiumDomain: PropTypes.object,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		renewPrice: PropTypes.string,
		domain: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
		isAdded: PropTypes.bool,
	};

	static defaultProps = {
		showChevron: false,
	};

	getAccessibleButtonLabel() {
		const { buttonContent, domain, translate, price, salePrice, priceRule } = this.props;
		let actionText = '';

		if ( typeof buttonContent === 'string' ) {
			actionText = buttonContent;
		} else if ( typeof buttonContent?.props?.children === 'string' ) {
			actionText = buttonContent.props.children;
		} else if ( Array.isArray( buttonContent?.props?.children ) ) {
			actionText = buttonContent.props.children.reduce( ( acc, item ) => {
				return typeof item === 'string' ? acc + item : acc;
			}, '' );
		}

		const baseLabel = translate( '%(action)s domain %(domain)s', {
			args: {
				action: actionText,
				domain,
			},
			comment:
				'Accessible label for domain selection button. %(action)s is the button action (Select, Selected, Upgrade, etc), %(domain)s is the domain name',
		} );

		if ( ( priceRule === 'FREE_DOMAIN' || priceRule === 'FREE_WITH_PLAN' ) && price ) {
			return translate(
				'%(baseLabel)s. Free for the first year with annual paid plans, then %(price)s per year',
				{
					args: {
						baseLabel,
						price,
					},
					comment: 'Accessible label for free domain with normal price',
				}
			);
		} else if ( salePrice && price ) {
			return translate(
				'%(baseLabel)s. %(salePrice)s for the first year, then %(price)s per year',
				{
					args: {
						baseLabel,
						salePrice,
						price,
					},
					comment: 'Accessible label for domain with sale price',
				}
			);
		} else if ( price ) {
			return translate( '%(baseLabel)s. %(price)s per year', {
				args: {
					baseLabel,
					price,
				},
				comment: 'Accessible label for regularly priced domain',
			} );
		}

		return baseLabel;
	}

	renderPrice() {
		const {
			hidePrice,
			premiumDomain,
			price,
			renewPrice,
			priceRule,
			salePrice,
			isSignupStep,
			showStrikedOutPrice,
		} = this.props;

		if ( hidePrice ) {
			return null;
		}

		if ( premiumDomain?.pending ) {
			return <div className="domain-suggestion__price-placeholder" />;
		}

		return (
			<DomainProductPrice
				price={ price }
				renewPrice={ renewPrice }
				salePrice={ salePrice }
				rule={ priceRule }
				isSignupStep={ isSignupStep }
				showStrikedOutPrice={ showStrikedOutPrice }
			/>
		);
	}

	render() {
		const { children, extraClasses, isAdded, isFeatured, showStrikedOutPrice, hideMatchReasons } =
			this.props;
		const classes = clsx(
			'domain-suggestion',
			'card',
			'is-compact',
			{
				'is-added': isAdded,
			},
			extraClasses
		);

		const contentClassName = clsx( 'domain-suggestion__content', {
			'domain-suggestion__content-domain': showStrikedOutPrice && ! isFeatured,
		} );

		const [ badges = null, domainContent = null, matchReason = null ] = Array.isArray( children )
			? children
			: [];

		return (
			<div className={ classes } data-e2e-domain={ this.props.domain }>
				{ badges }
				<div className={ contentClassName }>
					{ domainContent }
					{ matchReason }
					{ ( hideMatchReasons || ! isFeatured ) && this.renderPrice() }
					{ ! hideMatchReasons && isFeatured && (
						<div className="domain-suggestion__price-container">{ this.renderPrice() }</div>
					) }
					<div className="domain-suggestion__action-container">
						<Button
							className="domain-suggestion__action"
							onClick={ () => {
								this.props.onButtonClick( isAdded );
							} }
							data-tracks-button-click-source={ this.props.tracksButtonClickSource }
							aria-label={ this.getAccessibleButtonLabel() }
							{ ...this.props.buttonStyles }
						>
							{ this.props.buttonContent }
						</Button>
					</div>
				</div>

				{ this.props.showChevron && (
					<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
				) }
			</div>
		);
	}
}

function DomainSuggestionPlaceholder() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="domain-suggestion card is-compact is-placeholder is-clickable">
			<div className="domain-suggestion__content">
				<div />
			</div>
			<div className="domain-suggestion__action" />
			<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

DomainSuggestionPlaceholder.displayName = 'DomainSuggestionPlaceholder';
DomainSuggestion.Placeholder = DomainSuggestionPlaceholder;

const LocalizedDomainSuggestion = localize( DomainSuggestion );
LocalizedDomainSuggestion.Placeholder = DomainSuggestionPlaceholder;

export default LocalizedDomainSuggestion;
