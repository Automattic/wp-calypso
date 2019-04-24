/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { recordTracksEvent } from 'state/analytics/actions';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';

/**
 * Style dependencies
 */
import './style.scss';

class TrademarkClaimsNotice extends React.Component {
	static propTypes = {
		isSignupStep: PropTypes.bool,
		onAccept: PropTypes.func,
		onReject: PropTypes.func,
		suggestion: PropTypes.object,
		trademarkClaimsNoticeInfo: PropTypes.object,
	};

	static defaultProps = {};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			hasScrolledToBottom: false,
			showFullNotice: false,
		};
	}

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
		const { onReject, suggestion, translate } = this.props;
		const { domain_name: domain } = suggestion;

		return (
			<HeaderCake onClick={ onReject }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>
		);
	};

	renderPreamble = () => {
		const { suggestion, translate } = this.props;
		const { domain_name: domain } = suggestion;

		return (
			<CompactCard>
				<h2>{ translate( '%(domain)s matches a trademark.', { args: { domain } } ) }</h2>
				<p>
					{ translate(
						"To continue, you must agree not to infringe on the trademark holders's rights. Please review and acknowledge the following notice."
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
		this.setState( { showFullNotice: true } );
		window.addEventListener( 'scroll', this.handleScroll );
		defer( this.checkWindowIsScrollable );
	};

	renderShowNoticeLink = () => {
		const { translate } = this.props;
		return (
			<CompactCard>
				<Button onClick={ this.showNotice }>{ translate( 'Show Trademark Notice' ) }</Button>
			</CompactCard>
		);
	};

	renderNoticeActions = () => {
		const { onAccept, onReject, translate } = this.props;
		const { hasScrolledToBottom } = this.state;
		return (
			<div className="trademark-claims-notice__layout">
				<div className="trademark-claims-notice__actions-background">
					<CompactCard className="trademark-claims-notice__actions">
						<Button borderless onClick={ onReject } disabled={ ! hasScrolledToBottom }>
							{ translate( 'Choose Another Domain' ) }
						</Button>
						<Button primary onClick={ onAccept } disabled={ ! hasScrolledToBottom }>
							{ translate( 'Acknowledge Trademark' ) }
						</Button>
					</CompactCard>
				</div>
			</div>
		);
	};

	renderTrademarkClaimMark = claim => {
		const { markName } = claim;

		if ( ! markName ) {
			return;
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="mark-name">
				<span className="trademark-claims-notice__claim-item-label">Mark: </span>
				<span className="trademark-claims-notice__claim-item-data">{ markName }</span>
			</div>
		);
	};

	renderTrademarkClaimJurisdiction = claim => {
		const { jurDesc } = claim;

		if ( ! jurDesc ) {
			return;
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="jurisdiction">
				<span className="trademark-claims-notice__claim-item-label">Jurisdiction: </span>
				<span className="trademark-claims-notice__claim-item-data">{ jurDesc }</span>
			</div>
		);
	};

	renderTrademarkClaimGoodsAndServices = claim => {
		let { goodsAndServices } = claim;

		if ( ! goodsAndServices ) {
			return;
		}

		if ( ! Array.isArray( goodsAndServices ) ) {
			goodsAndServices = [ goodsAndServices ];
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="goods-and-services">
				<span className="trademark-claims-notice__claim-item-label">Goods and Services: </span>
				<ul className="trademark-claims-notice__claim-item-list">
					{ goodsAndServices.map( ( goods, index ) => (
						<li className="trademark-claims-notice__claim-item-data" key={ index }>
							{ goods }
						</li>
					) ) }
				</ul>
			</div>
		);
	};

	renderTrademarkClaimInternationalClassification = claim => {
		let { classDesc } = claim;

		if ( ! classDesc ) {
			return;
		}

		if ( ! Array.isArray( classDesc ) ) {
			classDesc = [ classDesc ];
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="international-classification">
				<span className="trademark-claims-notice__claim-item-label">
					International Class of Goods and Services or Equivalent if applicable:{' '}
				</span>
				<ul className="trademark-claims-notice__claim-item-list">
					{ classDesc.map( ( classification, index ) => (
						<li className="trademark-claims-notice__claim-item-data" key={ index }>
							{ classification }
						</li>
					) ) }
				</ul>
			</div>
		);
	};

	renderContactInfo = contact => {
		if ( ! contact ) {
			return;
		}

		const { addr } = contact;
		if ( addr.street && ! Array.isArray( addr.street ) ) {
			addr.street = [ addr.street ];
		}

		return (
			<ul className="trademark-claims-notice__claim-item-list">
				{ contact.name && (
					<li key="name">
						<span className="trademark-claims-notice__claim-item-label">Name: </span>
						<span className="trademark-claims-notice__claim-item-data">{ contact.name }</span>
					</li>
				) }
				{ contact.org && (
					<li key="org">
						<span className="trademark-claims-notice__claim-item-label">Organization: </span>
						<span className="trademark-claims-notice__claim-item-data">{ contact.org }</span>
					</li>
				) }
				{ addr.street &&
					addr.street.map( ( street, index ) => (
						<li key={ 'street' + index }>
							<span className="trademark-claims-notice__claim-item-label">Address: </span>
							<span className="trademark-claims-notice__claim-item-data">{ street }</span>
						</li>
					) ) }
				{ addr.city && (
					<li key="city">
						<span className="trademark-claims-notice__claim-item-label">City: </span>
						<span className="trademark-claims-notice__claim-item-data">{ addr.city }</span>
					</li>
				) }
				{ addr.sp && (
					<li key="sp">
						<span className="trademark-claims-notice__claim-item-label">State: </span>
						<span className="trademark-claims-notice__claim-item-data">{ addr.sp }</span>
					</li>
				) }
				{ addr.pc && (
					<li key="pc">
						<span className="trademark-claims-notice__claim-item-label">Postal Code: </span>
						<span className="trademark-claims-notice__claim-item-data">{ addr.pc }</span>
					</li>
				) }
				{ addr.cc && (
					<li key="cc">
						<span className="trademark-claims-notice__claim-item-label">Country: </span>
						<span className="trademark-claims-notice__claim-item-data">{ addr.cc }</span>
					</li>
				) }
				{ contact.voice && (
					<li key="voice">
						<span className="trademark-claims-notice__claim-item-label">Phone: </span>
						<span className="trademark-claims-notice__claim-item-data">{ contact.voice }</span>
					</li>
				) }
				{ contact.fax && (
					<li key="fax">
						<span className="trademark-claims-notice__claim-item-label">Fax: </span>
						<span className="trademark-claims-notice__claim-item-data">{ contact.fax }</span>
					</li>
				) }
				{ contact.email && (
					<li key="email">
						<span className="trademark-claims-notice__claim-item-label">Email: </span>
						<span className="trademark-claims-notice__claim-item-data">{ contact.email }</span>
					</li>
				) }
			</ul>
		);
	};

	renderTrademarkClaimRegistrant = claim => {
		const { holder } = claim;

		if ( ! holder ) {
			return;
		}

		const { addr } = holder;
		if ( addr.street && ! Array.isArray( addr.street ) ) {
			addr.street = [ addr.street ];
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="holder">
				<span className="trademark-claims-notice__claim-item-label">Trademark Registrant: </span>
				{ this.renderContactInfo( holder ) }
			</div>
		);
	};

	renderTrademarkClaimContact = claim => {
		const { contact } = claim;

		if ( ! contact ) {
			return;
		}

		const { addr } = contact;
		if ( addr.street && ! Array.isArray( addr.street ) ) {
			addr.street = [ addr.street ];
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="contact">
				<span className="trademark-claims-notice__claim-item-label">
					Trademark Registrant Contact:{' '}
				</span>
				{ this.renderContactInfo( contact ) }
			</div>
		);
	};

	renderTrademarkClaimCourtCases = courtCases => {
		if ( ! courtCases ) {
			return;
		}

		return courtCases.map( ( courtCase, index ) => (
			<ul
				className="trademark-claims-notice__claim-item-list trademark-claims-notice__claim-item"
				key={ index }
			>
				<li key="ref-num">
					<span className="trademark-claims-notice__claim-item-label">Reference Number: </span>
					<span className="trademark-claims-notice__claim-item-data">{ courtCase.refNum }</span>
				</li>
				<li key="cc">
					<span className="trademark-claims-notice__claim-item-label">Jurisdiction: </span>
					<span className="trademark-claims-notice__claim-item-data">{ courtCase.cc }</span>
				</li>
				<li key="court-name">
					<span className="trademark-claims-notice__claim-item-label">Court Name: </span>
					<span className="trademark-claims-notice__claim-item-data">{ courtCase.courtName }</span>
				</li>
			</ul>
		) );
	};

	renderTrademarkClaimUdrpCases = udrpCases => {
		if ( ! udrpCases ) {
			return;
		}

		return udrpCases.map( ( udrpCase, index ) => (
			<ul
				className="trademark-claims-notice__claim-item-list trademark-claims-notice__claim-item"
				key={ index }
			>
				<li key="case-no">
					<span className="trademark-claims-notice__claim-item-label">Case Number: </span>
					<span className="trademark-claims-notice__claim-item-data">{ udrpCase.caseNo }</span>
				</li>
				<li key="udrp-provider">
					<span className="trademark-claims-notice__claim-item-label">UDRP Provider: </span>
					<span className="trademark-claims-notice__claim-item-data">
						{ udrpCase.udrpProvider }
					</span>
				</li>
			</ul>
		) );
	};

	renderTrademarkClaimCases = claim => {
		const { notExactMatch } = claim;

		if ( ! notExactMatch ) {
			return;
		}

		let { court: courtCases, udrp: udrpCases } = notExactMatch;
		if ( courtCases && ! Array.isArray( courtCases ) ) {
			courtCases = [ courtCases ];
		}
		if ( udrpCases && ! Array.isArray( udrpCases ) ) {
			udrpCases = [ udrpCases ];
		}

		return (
			<div className="trademark-claims-notice__claim-item" key="claim-cases">
				<p>
					This domain name label has previously been found to be used or registered abusively
					against the following trademarks according to the referenced decisions:
				</p>
				{ courtCases && this.renderTrademarkClaimCourtCases( courtCases ) }
				{ udrpCases && this.renderTrademarkClaimUdrpCases( udrpCases ) }
			</div>
		);
	};

	renderTrademarkClaimsInfo = () => {
		const { trademarkClaimsNoticeInfo } = this.props;
		let { claim: claims } = trademarkClaimsNoticeInfo;

		if ( ! Array.isArray( claims ) ) {
			claims = [ claims ];
		}

		return (
			<ol>
				{ claims.map( ( claim, index ) => (
					<li className="trademark-claims-notice__claim" key={ index }>
						{ this.renderTrademarkClaimMark( claim ) }
						{ this.renderTrademarkClaimJurisdiction( claim ) }
						{ this.renderTrademarkClaimGoodsAndServices( claim ) }
						{ this.renderTrademarkClaimInternationalClassification( claim ) }
						{ this.renderTrademarkClaimRegistrant( claim ) }
						{ this.renderTrademarkClaimContact( claim ) }
						{ this.renderTrademarkClaimCases( claim ) }
					</li>
				) ) }
			</ol>
		);
	};

	// Note: Please don't update the language rendered here as it is specified in the RPM-Requirements of the
	// ICANN TMCH functional specifications in: https://tools.ietf.org/html/draft-ietf-eppext-tmch-func-spec-01#ref-RPM-Requirements
	renderNotice() {
		return (
			<Fragment>
				<CompactCard className="trademark-claims-notice__content">
					<h3>Trademark Notice</h3>
					<p>
						You have received this Trademark Notice because you have applied for a domain name which
						matches at least one trademark record submitted to the Trademark Clearinghouse.
					</p>
					<p>
						<strong>
							<em>
								You may or may not be entitled to register the domain name depending on your
								intended use and whether it is the same or significantly overlaps with the
								trademarks listed below. Your rights to register this domain name may or may not be
								protected as noncommercial use or “fair use” by the laws of your country.
							</em>
						</strong>
					</p>
					<p>
						Please read the trademark information below carefully, including the trademarks,
						jurisdictions, and goods and services for which the trademarks are registered. Please be
						aware that not all jurisdictions review trademark applications closely, so some of the
						trademark information below may exist in a national or regional registry which does not
						conduct a thorough or substantive review of trademark rights prior to registration. If
						you have questions, you may want to consult an attorney or legal expert on trademarks
						and intellectual property for guidance.
					</p>
					<p>
						If you continue with this registration, you represent that, you have received and you
						understand this notice and to the best of your knowledge, your registration and use of
						the requested domain name will not infringe on the trademark rights listed below. The
						following marks are listed in the Trademark Clearinghouse:
					</p>
					{ this.renderTrademarkClaimsInfo() }
				</CompactCard>
				{ this.renderNoticeActions() }
			</Fragment>
		);
	}

	render() {
		const { isSignupStep } = this.props;
		const { showFullNotice } = this.state;

		return (
			<div className="trademark-claims-notice">
				{ ! isSignupStep && this.renderHeader() }
				<div className="trademark-claims-notice__content">
					{ this.renderPreamble() }
					{ ! showFullNotice && this.renderShowNoticeLink() }
					{ showFullNotice && this.renderNotice() }
				</div>
			</div>
		);
	}
}

const recordAcknowledgeButtonClickInTrademarkClaimsNotice = domain_name =>
	recordTracksEvent( 'calypso_trademark_claims_notice_acknowledge_click', { domain_name } );

const recordRejectButtonClickInTrademarkClaimsNotice = domain_name =>
	recordTracksEvent( 'calypso_trademark_claims_notice_reject_click', { domain_name } );

export default connect(
	() => ( {} ),
	{
		recordAcknowledgeButtonClickInTrademarkClaimsNotice,
		recordRejectButtonClickInTrademarkClaimsNotice,
	}
)( localize( TrademarkClaimsNotice ) );
