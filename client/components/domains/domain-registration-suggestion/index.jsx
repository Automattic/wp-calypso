/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get, isNumber, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import DomainSuggestion from 'components/domains/domain-suggestion';
import {
	shouldBundleDomainWithPlan,
	getDomainPriceRule,
	hasDomainInCart,
	isPaidDomain,
} from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	parseMatchReasons,
	VALID_MATCH_REASONS,
} from 'components/domains/domain-registration-suggestion/utility';
import ProgressBar from 'components/progress-bar';
import { getDomainPrice, getDomainSalePrice, getTld, isHstsRequired } from 'lib/domains';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductsList } from 'state/products-list/selectors';
import Badge from 'components/badge';
import InfoPopover from 'components/info-popover';
import { HTTPS_SSL } from 'lib/url/support';

const NOTICE_GREEN = '#4ab866';

class DomainRegistrationSuggestion extends React.Component {
	static propTypes = {
		isDomainOnly: PropTypes.bool,
		isSignupStep: PropTypes.bool,
		isFeatured: PropTypes.bool,
		buttonStyles: PropTypes.object,
		cart: PropTypes.object,
		suggestion: PropTypes.shape( {
			domain_name: PropTypes.string.isRequired,
			product_slug: PropTypes.string,
			cost: PropTypes.string,
			match_reasons: PropTypes.arrayOf( PropTypes.oneOf( VALID_MATCH_REASONS ) ),
		} ).isRequired,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object,
		railcarId: PropTypes.string,
		recordTracksEvent: PropTypes.func,
		uiPosition: PropTypes.number,
		fetchAlgo: PropTypes.string,
		query: PropTypes.string,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
		productCost: PropTypes.string,
		productSaleCost: PropTypes.string,
	};

	componentDidMount() {
		this.recordRender();
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.railcarId !== this.props.railcarId ||
			prevProps.uiPosition !== this.props.uiPosition
		) {
			this.recordRender();
		}
	}

	recordRender() {
		if ( this.props.railcarId && isNumber( this.props.uiPosition ) ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			this.props.recordTracksEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: `${ this.props.fetchAlgo }/${ this.props.suggestion.vendor }`,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query,
			} );
		}
	}

	onButtonClick = () => {
		const { suggestion, railcarId } = this.props;

		if ( this.isUnavailableDomain( suggestion.domain_name ) ) {
			return;
		}

		if ( railcarId ) {
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				railcar: railcarId,
				action: 'domain_added_to_cart',
			} );
		}

		this.props.onButtonClick( suggestion );
	};

	isUnavailableDomain = domain => {
		return includes( this.props.unavailableDomains, domain );
	};

	getButtonProps() {
		const {
			cart,
			domainsWithPlansOnly,
			isSignupStep,
			selectedSite,
			suggestion,
			translate,
			pendingCheckSuggestion,
		} = this.props;
		const { domain_name: domain } = suggestion;
		const isAdded = hasDomainInCart( cart, domain );

		let buttonContent;
		let buttonStyles = this.props.buttonStyles;
		const buttonCopyTest =
			abtest( 'domainSelectButtonCopy' ) === 'purchase'
				? translate( 'Purchase', { context: 'Domain mapping suggestion button' } )
				: translate( 'Select', { context: 'Domain mapping suggestion button' } );

		if ( isAdded ) {
			buttonContent = translate( '{{checkmark/}} In Cart', {
				context: 'Domain is already added to shopping cart',
				components: { checkmark: <Gridicon icon="checkmark" /> },
			} );

			buttonStyles = { ...buttonStyles, primary: false };
		} else if ( isSignupStep ) {
			buttonContent = translate( 'Select', { context: 'Domain mapping suggestion button' } );
		} else {
			buttonContent = shouldBundleDomainWithPlan(
				domainsWithPlansOnly,
				selectedSite,
				cart,
				suggestion
			)
				? translate( 'Upgrade', {
						context: 'Domain mapping suggestion button with plan upgrade',
				  } )
				: buttonCopyTest;
		}

		if ( this.isUnavailableDomain( suggestion.domain_name ) ) {
			buttonStyles = { ...buttonStyles, disabled: true };
			buttonContent = translate( 'Unavailable', {
				context: 'Domain suggestion is not available for registration',
			} );
		} else if ( pendingCheckSuggestion ) {
			if ( pendingCheckSuggestion.domain_name === suggestion.domain_name ) {
				buttonStyles = { ...buttonStyles, busy: true };
			} else {
				buttonStyles = { ...buttonStyles, disabled: true };
			}
		}
		return {
			buttonContent,
			buttonStyles,
		};
	}

	getPriceRule() {
		const { cart, isDomainOnly, domainsWithPlansOnly, selectedSite, suggestion } = this.props;
		return getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion, isDomainOnly );
	}

	renderDomain() {
		const {
			isFeatured,
			showHstsNotice,
			productSaleCost,
			suggestion: { domain_name: domain },
			translate,
		} = this.props;

		let isAvailable = false;

		//If we're on the Mapping or Transfer pages, add a note about availability
		if ( includes( page.current, '/mapping' ) || includes( page.current, '/transfer' ) ) {
			isAvailable = true;
		}

		const title = isAvailable ? translate( '%s is available!', { args: domain } ) : domain;
		const paidDomain = isPaidDomain( this.getPriceRule() );
		const saleBadgeText = translate( 'Sale', {
			comment: 'Shown next to a domain that has a special discounted sale price',
		} );
		const infoPopoverSize = isFeatured ? 22 : 18;

		return (
			<div className="domain-registration-suggestion__title-wrapper">
				<h3 className="domain-registration-suggestion__title">{ title }</h3>
				{ productSaleCost && paidDomain && <Badge>{ saleBadgeText }</Badge> }
				{ showHstsNotice && (
					<InfoPopover
						className="domain-registration-suggestion__hsts-tooltip"
						iconSize={ infoPopoverSize }
						position={ 'right' }
					>
						{ translate(
							'All domains ending in {{strong}}%(tld)s{{/strong}} require an SSL certificate ' +
								'to host a website. When you host this domain at WordPress.com an SSL ' +
								'certificate is included in your paid plan. {{a}}Learn more{{/a}}.',
							{
								args: {
									tld: '.' + getTld( domain ),
								},
								components: {
									a: <a href={ HTTPS_SSL } target="_blank" rel="noopener noreferrer" />,
									strong: <strong />,
								},
							}
						) }
					</InfoPopover>
				) }
			</div>
		);
	}

	renderProgressBar() {
		const {
			suggestion: { isRecommended, isBestAlternative, relevance: matchScore },
			translate,
			isFeatured,
		} = this.props;

		if ( ! isFeatured ) {
			return null;
		}

		let title, progressBarProps;
		if ( isRecommended ) {
			title = translate( 'Best Match' );
			progressBarProps = {
				color: NOTICE_GREEN,
				title,
				value: matchScore * 100 || 90,
			};
		}

		if ( isBestAlternative ) {
			title = translate( 'Best Alternative' );
			progressBarProps = {
				title,
				value: matchScore * 100 || 80,
			};
		}

		if ( title ) {
			return (
				<div className="domain-registration-suggestion__progress-bar">
					<ProgressBar { ...progressBarProps } />
					<span className="domain-registration-suggestion__progress-bar-text">{ title }</span>
				</div>
			);
		}
	}

	renderMatchReason() {
		const {
			suggestion: { domain_name: domain },
			isFeatured,
		} = this.props;

		if ( ! isFeatured || ! Array.isArray( this.props.suggestion.match_reasons ) ) {
			return null;
		}

		const matchReasons = parseMatchReasons( domain, this.props.suggestion.match_reasons );

		return (
			<div className="domain-registration-suggestion__match-reasons">
				{ matchReasons.map( ( phrase, index ) => (
					<div className="domain-registration-suggestion__match-reason" key={ index }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ phrase }
					</div>
				) ) }
			</div>
		);
	}

	render() {
		const {
			domainsWithPlansOnly,
			isFeatured,
			suggestion: { domain_name: domain },
			productCost,
			productSaleCost,
		} = this.props;

		const isUnavailableDomain = this.isUnavailableDomain( domain );

		const extraClasses = classNames( {
			'featured-domain-suggestion': isFeatured,
			'is-unavailable': isUnavailableDomain,
		} );

		return (
			<DomainSuggestion
				extraClasses={ extraClasses }
				priceRule={ this.getPriceRule() }
				price={ productCost }
				salePrice={ productSaleCost }
				domain={ domain }
				domainsWithPlansOnly={ domainsWithPlansOnly }
				onButtonClick={ this.onButtonClick }
				{ ...this.getButtonProps() }
			>
				{ this.renderDomain() }
				{ this.renderProgressBar() }
				{ this.renderMatchReason() }
			</DomainSuggestion>
		);
	}
}

const mapStateToProps = ( state, props ) => {
	const productSlug = get( props, 'suggestion.product_slug' );
	const productsList = getProductsList( state );
	const currentUserCurrencyCode = getCurrentUserCurrencyCode( state );

	return {
		showHstsNotice: isHstsRequired( productSlug, productsList ),
		productCost: getDomainPrice( productSlug, productsList, currentUserCurrencyCode ),
		productSaleCost: getDomainSalePrice( productSlug, productsList, currentUserCurrencyCode ),
	};
};

export default connect(
	mapStateToProps,
	{ recordTracksEvent }
)( localize( DomainRegistrationSuggestion ) );
