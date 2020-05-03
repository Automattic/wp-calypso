/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer, get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import HeaderCake from 'components/header-cake';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { checkDomainAvailability } from 'lib/domains';
import { getSelectedSite } from 'state/ui/selectors';
import TrademarkNotice from './trademark-notice';

/**
 * Style dependencies
 */
import './style.scss';

class TrademarkClaimsNotice extends React.Component {
	static propTypes = {
		domain: PropTypes.string,
		isSignupStep: PropTypes.bool,
		onAccept: PropTypes.func,
		onGoBack: PropTypes.func,
		onReject: PropTypes.func,
		recordAcknowledgeTrademarkButtonClickInTrademarkNotice: PropTypes.func,
		recordChooseAnotherDomainButtonClickInTrademarkNotice: PropTypes.func,
		recordShowTrademarkNoticeButtonClickInTrademarkNotice: PropTypes.func,
		trademarkClaimsNoticeInfo: PropTypes.object,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		trademarkClaimsNoticeInfo: null,
		isSignupStep: false,
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			hasScrolledToBottom: false,
			showFullNotice: false,
			trademarkClaimsNoticeInfo: this.props.trademarkClaimsNoticeInfo,
			finishedFetching: ! isEmpty( this.props.trademarkClaimsNoticeInfo ),
		};
	}

	UNSAFE_componentWillMount() {
		if ( isEmpty( this.props.trademarkClaimsNoticeInfo ) && ! this.state.finishedFetching ) {
			this.checkDomainAvailability().then( ( { trademarkClaimsNoticeInfo } ) => {
				this.setState( {
					trademarkClaimsNoticeInfo,
					finishedFetching: true,
				} );
			} );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.handleScroll );
	}

	checkDomainAvailability = () => {
		const { domain } = this.props;

		return new Promise( ( resolve ) => {
			checkDomainAvailability(
				{
					domainName: domain,
					blogId: get( this.props, 'selectedSite.ID', null ),
					isCartPreCheck: false,
				},
				( error, result ) => {
					resolve( {
						trademarkClaimsNoticeInfo: get( result, 'trademark_claims_notice_info', null ),
					} );
				}
			);
		} );
	};

	enableActionButtons = () => {
		this.setState( { hasScrolledToBottom: true } );
		window.removeEventListener( 'scroll', this.handleScroll );
	};

	handleScroll = () => {
		const { hasScrolledToBottom } = this.state;
		if ( hasScrolledToBottom ) {
			return;
		}

		const element = document.scrollingElement;

		if ( element.scrollHeight - element.scrollTop < element.clientHeight + 100 ) {
			this.enableActionButtons();
		}
	};

	renderHeader = () => {
		const { onGoBack, domain, translate } = this.props;

		return (
			<HeaderCake onClick={ onGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>
		);
	};

	renderPreamble = () => {
		const { domain, translate } = this.props;

		return (
			<CompactCard>
				<h2>{ translate( '%(domain)s matches a trademark.', { args: { domain } } ) }</h2>
				<p>
					{ translate(
						"To continue, you must agree not to infringe on the trademark holders' rights. Please review and acknowledge the following notice."
					) }
				</p>
			</CompactCard>
		);
	};

	checkWindowIsScrollable = () => {
		const element = document.scrollingElement;

		if ( ! element || element.scrollHeight <= element.clientHeight ) {
			this.enableActionButtons();
		}
	};

	showNotice = () => {
		const { domain } = this.props;
		this.setState( { showFullNotice: true } );
		window.addEventListener( 'scroll', this.handleScroll );
		defer( this.checkWindowIsScrollable );
		this.props.recordShowTrademarkNoticeButtonClickInTrademarkNotice( domain );
	};

	renderShowNoticeLink = () => {
		const { translate } = this.props;
		return (
			<CompactCard>
				<Button onClick={ this.showNotice }>{ translate( 'Show Trademark Notice' ) }</Button>
			</CompactCard>
		);
	};

	onAccept = () => {
		const { domain } = this.props;
		this.props.recordAcknowledgeTrademarkButtonClickInTrademarkNotice( domain );
		this.props.onAccept();
	};

	onReject = () => {
		const { domain } = this.props;
		this.props.recordChooseAnotherDomainButtonClickInTrademarkNotice( domain );
		this.props.onReject();
	};

	renderPlaceholder = () => {
		const { domain, translate } = this.props;

		return (
			<CompactCard>
				<h2>
					{ translate( 'Checking for trademark claims on %(domain)s', { args: { domain } } ) }
				</h2>
				<p>
					{ translate(
						'Please wait a moment while we check for any trademark claims that affect the registration of this domain name.'
					) }
				</p>
			</CompactCard>
		);
	};

	renderTrademarkClaimsNotice = () => {
		const { hasScrolledToBottom, showFullNotice, trademarkClaimsNoticeInfo } = this.state;

		return (
			<Fragment>
				{ this.renderPreamble() }
				{ /*{ showFullNotice ? this.renderNotice() : this.renderShowNoticeLink() }*/ }
				{ showFullNotice ? (
					<TrademarkNotice
						buttonsEnabled={ hasScrolledToBottom }
						onAccept={ this.onAccept }
						onReject={ this.onReject }
						trademarkClaimsInfo={ trademarkClaimsNoticeInfo }
					/>
				) : (
					this.renderShowNoticeLink()
				) }
			</Fragment>
		);
	};

	renderNoClaimsMessage = () => {
		const { domain, translate } = this.props;

		return (
			<CompactCard>
				<h2>{ translate( '%(domain)s has no trademark claims', { args: { domain } } ) }</h2>
				<p>
					{ translate(
						"We didn't find any trademark claims for this domain. Click the button below to continue with domain registration."
					) }
				</p>
				<Button onClick={ this.onAccept() }>{ translate( 'Register this domain' ) }</Button>
			</CompactCard>
		);
	};

	renderContent = () => {
		const { trademarkClaimsNoticeInfo } = this.state;

		return isEmpty( trademarkClaimsNoticeInfo )
			? this.renderNoClaimsMessage()
			: this.renderTrademarkClaimsNotice();
	};

	render() {
		const { isSignupStep } = this.props;
		const { finishedFetching, trademarkClaimsNoticeInfo } = this.state;
		const showPlaceholder = isEmpty( trademarkClaimsNoticeInfo ) && ! finishedFetching;
		const content = showPlaceholder ? this.renderPlaceholder() : this.renderContent();

		return (
			<div className="trademark-claims-notice">
				{ ! isSignupStep && this.renderHeader() }
				<div className="trademark-claims-notice__content">{ content }</div>
			</div>
		);
	}
}

export const recordShowTrademarkNoticeButtonClickInTrademarkNotice = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Show Trademark Notice" on the Trademark Notice page in the Domain Search Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_show_trademark_notice_click', {
			domain_name: domainName,
			section: 'domains',
		} )
	);

export const recordChooseAnotherDomainButtonClickInTrademarkNotice = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Choose Another Domain" on the Trademark Notice page in the Domain Search Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_choose_another_domain_trademark_notice_click', {
			domain_name: domainName,
			section: 'domains',
		} )
	);

export const recordAcknowledgeTrademarkButtonClickInTrademarkNotice = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Acknowledge Trademark" on the Trademark Notice page in the Domain Search Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_acknowledge_trademark_notice_click', {
			domain_name: domainName,
			section: 'domains',
		} )
	);

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ), {
	recordAcknowledgeTrademarkButtonClickInTrademarkNotice,
	recordChooseAnotherDomainButtonClickInTrademarkNotice,
	recordShowTrademarkNoticeButtonClickInTrademarkNotice,
} )( localize( TrademarkClaimsNotice ) );
