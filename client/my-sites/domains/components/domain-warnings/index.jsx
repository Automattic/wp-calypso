/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import _debug from 'debug';
import { intersection, map, every, find, get } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { withLocalizedMoment } from 'components/localized-moment';
import PendingGSuiteTosNotice from './pending-gsuite-tos-notice';
import { purchasesRoot } from 'me/purchases/paths';
import { type as domainTypes, transferStatus, gdprConsentStatus } from 'lib/domains/constants';
import { hasPendingGSuiteUsers } from 'lib/gsuite';
import { isSubdomain } from 'lib/domains';
import {
	CHANGE_NAME_SERVERS,
	DOMAINS,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	MAP_EXISTING_DOMAIN_UPDATE_DNS,
	MAP_SUBDOMAIN,
	SETTING_PRIMARY_DOMAIN,
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
} from 'lib/url/support';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementNameServers,
	domainManagementTransferIn,
	domainManagementManageConsent,
} from 'my-sites/domains/paths';
import TrackComponentView from 'lib/analytics/track-component-view';

/**
 * Style dependencies
 */
import './style.scss';

const debug = _debug( 'calypso:domain-warnings' );

const newWindowLink = ( linkUrl ) => (
	<a href={ linkUrl } target="_blank" rel="noopener noreferrer" />
);
const domainsLink = newWindowLink( DOMAINS );
const pNode = <p />;

const expiredDomainsCanManageWarning = 'expired-domains-can-manage';
const expiredDomainsCannotManageWarning = 'expired-domains-cannot-manage';
const expiringDomainsCanManageWarning = 'expiring-domains-can-manage';
const expiringDomainsCannotManageWarning = 'expiring-domains-cannot-manage';
const newTransfersWrongNSWarning = 'new-transfer-wrong-ns';

export class DomainWarnings extends React.PureComponent {
	static propTypes = {
		domains: PropTypes.array,
		ruleWhiteList: PropTypes.array,
		domain: PropTypes.object,
		isCompact: PropTypes.bool,
		siteIsUnlaunched: PropTypes.bool,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	static defaultProps = {
		isCompact: false,
		ruleWhiteList: [
			'expiredDomainsCanManage',
			'expiringDomainsCanManage',
			'unverifiedDomainsCanManage',
			'pendingGSuiteTosAcceptanceDomains',
			'expiredDomainsCannotManage',
			'expiringDomainsCannotManage',
			'unverifiedDomainsCannotManage',
			'wrongNSMappedDomains',
			'newDomains',
			'transferStatus',
			'newTransfersWrongNS',
			'pendingConsent',
		],
	};

	renewLink( domains, onClick ) {
		const count = domains.length;
		const { selectedSite, translate } = this.props;
		const fullMessage = translate( 'Renew it now.', 'Renew them now.', {
			count,
			context: 'Call to action link for renewing an expiring/expired domain',
		} );
		const compactMessage = translate( 'Renew', {
			context: 'Call to action link for renewing an expiring/expired domain',
		} );
		const domain = domains[ 0 ].name;
		const subscriptionId = domains[ 0 ].subscriptionId;
		const link =
			count === 1
				? `/checkout/domain_map:${ domain }/renew/${ subscriptionId }/${ selectedSite.slug }`
				: purchasesRoot;

		return (
			<NoticeAction href={ link } onClick={ onClick }>
				{ this.props.isCompact ? compactMessage : fullMessage }
			</NoticeAction>
		);
	}

	getPipe() {
		const allRules = [
			this.expiredDomainsCanManage,
			this.expiringDomainsCanManage,
			this.unverifiedDomainsCanManage,
			this.unverifiedDomainsCannotManage,
			this.pendingGSuiteTosAcceptanceDomains,
			this.expiredDomainsCannotManage,
			this.expiringDomainsCannotManage,
			this.wrongNSMappedDomains,
			this.newDomains,
			this.pendingTransfer,
			this.transferStatus,
			this.newTransfersWrongNS,
			this.pendingConsent,
		];
		const validRules = this.props.ruleWhiteList.map( ( ruleName ) => this[ ruleName ] );
		return intersection( allRules, validRules );
	}

	getDomains() {
		return this.props.domains || [ this.props.domain ];
	}

	trackImpression( warning, count ) {
		const { position } = this.props;

		return (
			<TrackComponentView
				eventName="calypso_domain_warning_impression"
				eventProperties={ { position, warning, count } }
			/>
		);
	}

	trackClick( warning ) {
		const { position } = this.props;
		this.props.recordTracksEvent( 'calypso_domain_warning_click', { position, warning } );
	}

	wrongNSMappedDomains = () => {
		debug( 'Rendering wrongNSMappedDomains' );

		if (
			get( this.props, 'selectedSite.jetpack' ) ||
			get( this.props, 'selectedSite.options.is_automated_transfer' )
		) {
			return null;
		}

		const wrongMappedDomains = this.getDomains().filter(
			( domain ) => domain.type === domainTypes.MAPPED && ! domain.pointsToWpcom
		);

		debug( 'NS error domains:', wrongMappedDomains );
		if ( wrongMappedDomains.length === 0 ) {
			return null;
		}

		const { translate } = this.props;
		let learnMoreUrl;
		let text;
		let offendingList = null;

		if ( wrongMappedDomains.length === 1 ) {
			const domain = wrongMappedDomains[ 0 ];
			if ( isSubdomain( domain.name ) ) {
				text = translate(
					"{{strong}}%(domainName)s's{{/strong}} DNS records need to be configured.",
					{
						components: { strong: <strong /> },
						args: { domainName: domain.name },
						context: 'Notice for mapped subdomain that has DNS records need to set up',
					}
				);
				learnMoreUrl = MAP_SUBDOMAIN;
			} else {
				text = translate(
					"Action required: Please contact your domain registrar to point {{strong}}%(domainName)s's{{/strong}} name server records to WordPress.com.",
					{
						components: { strong: <strong /> },
						args: { domainName: domain.name },
					}
				);
				learnMoreUrl = MAP_DOMAIN_CHANGE_NAME_SERVERS;
			}
		} else {
			offendingList = (
				<ul>
					{ wrongMappedDomains.map( ( domain ) => (
						<li key={ domain.name }>{ domain.name }</li>
					) ) }
				</ul>
			);
			if ( every( map( wrongMappedDomains, 'name' ), isSubdomain ) ) {
				text = translate( "Some of your domains' DNS records need to be configured.", {
					context: 'Notice for mapped subdomain that has DNS records need to set up',
				} );
				learnMoreUrl = MAP_SUBDOMAIN;
			} else {
				text = translate( "Some of your domains' name server records need to be configured.", {
					context: 'Mapped domain notice with NS records pointing to somewhere else',
				} );
				learnMoreUrl = MAP_EXISTING_DOMAIN_UPDATE_DNS;
			}
		}
		const noticeProps = {
			isCompact: this.props.isCompact,
			status: 'is-warning',
			className: 'domain-warnings__notice',
			showDismiss: false,
			key: 'wrong-ns-mapped-domain',
		};
		let children;
		if ( this.props.isCompact ) {
			noticeProps.text = translate( 'Complete domain setup' );
			children = (
				<NoticeAction href={ domainManagementList( this.props.selectedSite.slug ) }>
					{ translate( 'Go' ) }
				</NoticeAction>
			);
		} else {
			children = (
				<span>
					{ text }{ ' ' }
					<a href={ learnMoreUrl } target="_blank" rel="noopener noreferrer">
						{ translate( 'Learn more' ) }
					</a>
					{ offendingList }
				</span>
			);
		}
		return <Notice { ...noticeProps }>{ children }</Notice>;
	};

	onExpiredDomainsNoticeClick = () => {
		this.trackClick( expiredDomainsCanManageWarning );
	};

	expiredDomainsCanManage = () => {
		debug( 'Rendering expiredDomainsCanManage' );
		const expiredDomains = this.getDomains().filter(
			( domain ) =>
				domain.expired && domain.type === domainTypes.REGISTERED && domain.currentUserCanManage
		);

		if ( expiredDomains.length === 0 ) {
			return null;
		}

		const { translate, moment } = this.props;
		let text;
		if ( expiredDomains.length === 1 ) {
			text = translate( '{{strong}}%(domainName)s{{/strong}} expired %(timeSince)s.', {
				components: { strong: <strong /> },
				args: {
					timeSince: moment( expiredDomains[ 0 ].expiry ).fromNow(),
					domainName: expiredDomains[ 0 ].name,
				},
				context: 'Expired domain notice',
				comment: '%(timeSince)s is something like "a year ago"',
			} );
		} else {
			text = translate( 'Some of your domains have expired.', {
				context: 'Expired domain notice',
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				key={ expiredDomainsCanManageWarning }
				text={ text }
			>
				{ this.renewLink( expiredDomains, this.onExpiredDomainsNoticeClick ) }
				{ this.trackImpression( expiredDomainsCanManageWarning, expiredDomains.length ) }
			</Notice>
		);
	};

	expiredDomainsCannotManage = () => {
		const expiredDomains = this.getDomains().filter(
			( domain ) =>
				domain.expired && domain.type === domainTypes.REGISTERED && ! domain.currentUserCanManage
		);

		if ( expiredDomains.length === 0 ) {
			return null;
		}

		const { translate, moment } = this.props;
		let text;
		if ( expiredDomains.length === 1 ) {
			text = translate(
				'The domain {{strong}}%(domainName)s{{/strong}} expired %(timeSince)s. ' +
					'It can be renewed by the user {{strong}}%(owner)s{{/strong}}.',
				{
					components: { strong: <strong /> },
					args: {
						timeSince: moment( expiredDomains[ 0 ].expiry ).fromNow(),
						domainName: expiredDomains[ 0 ].name,
						owner: expiredDomains[ 0 ].owner,
					},
					context: 'Expired domain notice',
					comment: '%(timeSince)s is something like "a year ago"',
				}
			);
		} else {
			text = translate(
				'Some domains on this site expired recently. They can be renewed by their owners.',
				{
					context: 'Expired domain notice',
				}
			);
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				key={ expiredDomainsCannotManageWarning }
				text={ text }
			>
				{ this.trackImpression( expiredDomainsCannotManageWarning, expiredDomains.length ) }
			</Notice>
		);
	};

	onExpiringDomainsNoticeClick = () => {
		this.trackClick( expiredDomainsCanManageWarning );
	};

	expiringDomainsCanManage = () => {
		const expiringDomains = this.getDomains().filter(
			( domain ) =>
				domain.expirySoon && domain.type === domainTypes.REGISTERED && domain.currentUserCanManage
		);

		if ( expiringDomains.length === 0 ) {
			return null;
		}

		const { translate, moment } = this.props;

		let text;
		if ( expiringDomains.length === 1 ) {
			text = translate( '{{strong}}%(domainName)s{{/strong}} is expiring %(timeUntil)s.', {
				components: { strong: <strong /> },
				args: {
					timeUntil: moment( expiringDomains[ 0 ].expiry ).fromNow(),
					domainName: expiringDomains[ 0 ].name,
				},
				context: 'Expiring soon domain notice',
				comment: '%(timeUntil)s is something like "in a week"',
			} );
		} else {
			text = translate( 'Some of your domains are expiring soon.', {
				context: 'Expiring domain notice',
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				key={ expiringDomainsCanManageWarning }
				text={ text }
			>
				{ this.renewLink( expiringDomains, this.onExpiringDomainsNoticeClick ) }
				{ this.trackImpression( expiringDomainsCanManageWarning, expiringDomains.length ) }
			</Notice>
		);
	};

	expiringDomainsCannotManage = () => {
		const expiringDomains = this.getDomains().filter(
			( domain ) =>
				domain.expirySoon && domain.type === domainTypes.REGISTERED && ! domain.currentUserCanManage
		);

		if ( expiringDomains.length === 0 ) {
			return null;
		}

		const { translate, moment } = this.props;
		let text;
		if ( expiringDomains.length === 1 ) {
			text = translate(
				'The domain {{strong}}%(domainName)s{{/strong}} will expire %(timeUntil)s. ' +
					'It can be renewed by the user {{strong}}%(owner)s{{/strong}}.',
				{
					components: { strong: <strong /> },
					args: {
						timeUntil: moment( expiringDomains[ 0 ].expiry ).fromNow(),
						domainName: expiringDomains[ 0 ].name,
						owner: expiringDomains[ 0 ].owner,
					},
					context: 'Expiring soon domain notice',
					comment: '%(timeUntil)s is something like "in a week"',
				}
			);
		} else {
			text = translate(
				'Some domains on this site are about to expire. They can be renewed by their owners.',
				{
					context: 'Expiring domain notice',
				}
			);
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				key={ expiringDomainsCannotManageWarning }
				text={ text }
			>
				{ this.trackImpression( expiringDomainsCannotManageWarning, expiringDomains.length ) }
			</Notice>
		);
	};

	onNewTransfersWrongNSNoticeClick = () => {
		this.trackClick( newTransfersWrongNSWarning );
	};

	newTransfersWrongNS = () => {
		const { translate, isCompact, moment } = this.props;
		const newTransfers = this.getDomains().filter(
			( domain ) =>
				domain.registrationDate &&
				moment( domain.registrationDate ).add( 3, 'days' ).isAfter( moment() ) &&
				domain.transferStatus === transferStatus.COMPLETED &&
				! domain.hasWpcomNameservers
		);

		if ( newTransfers.length === 0 ) {
			return null;
		}

		let compactMessage;
		let actionLink;
		let actionText;
		let compactActionText;
		let message;

		if ( newTransfers.length > 1 ) {
			actionLink = CHANGE_NAME_SERVERS;
			actionText = translate( 'Learn more', {
				comment: 'Call to action link for updating the nameservers on a newly transferred domain',
			} );
			compactActionText = translate( 'Info', {
				comment: 'Call to action link for updating the nameservers on a newly transferred domain',
			} );
			compactMessage = translate( 'Domains require updating' );
			message = translate(
				'To make your newly transferred domains work with WordPress.com, you need to ' +
					'update the nameservers.'
			);
		} else {
			const domain = newTransfers[ 0 ].name;
			actionLink = domainManagementNameServers( this.props.selectedSite.slug, domain );
			actionText = translate( 'Update now', {
				comment: 'Call to action link for updating the nameservers on a newly transferred domain',
			} );
			compactActionText = translate( 'Fix', {
				comment: 'Call to action link for updating the nameservers on a newly transferred domain',
			} );
			compactMessage = translate( 'Domain requires updating' );
			message = translate(
				'To make {{strong}}%(domain)s{{/strong}} work with your WordPress.com site, you need to ' +
					'update the nameservers.',
				{
					components: {
						strong: <strong />,
					},
					args: { domain },
				}
			);
		}

		const action = (
			<NoticeAction
				href={ actionLink }
				onClick={ this.onNewTransfersWrongNSNoticeClick }
				rel="noopener noreferrer"
			>
				{ isCompact ? compactActionText : actionText }
			</NoticeAction>
		);

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				status="is-warning"
				key="new-transfer-wrong-ns"
				text={ isCompact ? compactMessage : message }
			>
				{ action }
				{ this.trackImpression( newTransfersWrongNSWarning, newTransfers.length ) }
			</Notice>
		);
	};

	newDomains = () => {
		if ( get( this.props, 'selectedSite.options.is_domain_only' ) ) {
			return null;
		}

		const { translate, moment } = this.props;

		const newDomains = this.getDomains().filter(
			( domain ) =>
				domain.registrationDate &&
				moment( domain.registrationDate ).add( 30, 'minutes' ).isAfter( moment() ) &&
				domain.type === domainTypes.REGISTERED
		);

		if ( newDomains.length === 0 ) {
			return null;
		}

		const hasNewPrimaryDomain = newDomains.some(
			( domain ) => this.props.selectedSite.domain === domain.name
		);
		let text;
		if ( newDomains.length > 1 ) {
			if ( hasNewPrimaryDomain ) {
				text = translate(
					'{{pNode}}We are setting up your new domains for you. ' +
						'They should start working immediately, but may be unreliable during the first 30 minutes.{{/pNode}}' +
						'{{pNode}}If you are unable to access your site at %(primaryDomain)s, try setting the primary domain to a domain ' +
						'you know is working. {{domainsLink}}Learn more{{/domainsLink}} about setting the primary domain.{{/pNode}}',
					{
						args: { primaryDomain: this.props.selectedSite.domain },
						components: {
							pNode,
							domainsLink: newWindowLink( SETTING_PRIMARY_DOMAIN ),
						},
					}
				);
			} else {
				text = translate(
					'We are setting up your new domains for you. They should start working immediately, ' +
						'but may be unreliable during the first 30 minutes. ' +
						'{{domainsLink}}Learn more{{/domainsLink}}.',
					{ components: { domainsLink } }
				);
			}
		} else {
			const domain = newDomains[ 0 ];
			if ( hasNewPrimaryDomain ) {
				text = translate(
					'{{pNode}}We are setting up {{strong}}%(domainName)s{{/strong}} for you. ' +
						'It should start working immediately, but may be unreliable during the first 30 minutes.{{/pNode}}' +
						'{{pNode}}If you are unable to access your site at {{strong}}%(domainName)s{{/strong}}, ' +
						'try setting the primary domain to a domain you know is working. ' +
						'{{domainsLink}}Learn more{{/domainsLink}} about setting the primary domain, or ' +
						'{{tryNowLink}}try {{strong}}%(domainName)s{{/strong}} now.{{/tryNowLink}}{{/pNode}}',
					{
						args: { domainName: domain.name },
						components: {
							domainsLink: newWindowLink( SETTING_PRIMARY_DOMAIN ),
							pNode,
							tryNowLink: newWindowLink( `http://${ domain.name }` ),
							strong: <strong />,
						},
					}
				);
			} else {
				text = translate(
					'We are setting up {{strong}}%(domainName)s{{/strong}} for you. ' +
						'It should start working immediately, but may be unreliable during the first 30 minutes. ' +
						'{{domainsLink}}Learn more{{/domainsLink}} about your new domain, or ' +
						'{{tryNowLink}} try it now{{/tryNowLink}}.',
					{
						args: { domainName: domain.name },
						components: {
							domainsLink,
							tryNowLink: newWindowLink( `http://${ domain.name }` ),
							strong: <strong />,
						},
					}
				);
			}
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-warning"
				showDismiss={ false }
				key="new-domains"
			>
				{ text }
			</Notice>
		);
	};

	unverifiedDomainsCanManage = () => {
		const domains = this.getDomains().filter(
			( domain ) => domain.isPendingIcannVerification && domain.currentUserCanManage
		);

		if ( domains.length === 0 ) {
			return null;
		}

		const { translate, moment } = this.props;

		const isWithinTwoDays = domains.some(
			( { registrationDate } ) =>
				registrationDate && moment( registrationDate ).add( 2, 'days' ).isAfter()
		);
		if ( this.props.isSiteEligibleForFSE && this.props.siteIsUnlaunched && isWithinTwoDays ) {
			// Customer Home nudges this on unlaunched sites.
			// After two days let's re-display the nudge
			return;
		}

		const severity = isWithinTwoDays ? 'is-info' : 'is-error';
		const action = translate( 'Fix' );

		if ( domains.length === 1 ) {
			const domain = domains[ 0 ].name;
			let fullMessage, compactMessage;
			if ( severity === 'is-error' ) {
				fullMessage = translate(
					'Your domain {{strong}}%(domain)s{{/strong}} may be suspended because your email address is not verified.',
					{
						components: { strong: <strong /> },
						args: { domain },
					}
				);
				compactMessage = translate( 'Issues with {{strong}}%(domain)s{{/strong}}.', {
					components: { strong: <strong /> },
					args: { domain },
				} );
			} else if ( severity === 'is-info' ) {
				fullMessage = translate(
					'{{strong}}%(domain)s{{/strong}} needs to be verified. You should receive an email shortly with more information.',
					{
						components: { strong: <strong /> },
						args: { domain },
					}
				);
				compactMessage = translate( 'Please verify {{strong}}%(domain)s{{/strong}}.', {
					components: { strong: <strong /> },
					args: { domain },
				} );
			}

			return (
				<Notice
					isCompact={ this.props.isCompact }
					status={ severity }
					showDismiss={ false }
					className="domain-warnings__notice"
					key="unverified-domains-can-manage"
					text={ this.props.isCompact ? compactMessage : fullMessage }
				>
					<NoticeAction href={ domainManagementEdit( this.props.selectedSite.slug, domain ) }>
						{ action }
					</NoticeAction>
				</Notice>
			);
		}

		let fullContent, compactContent, compactNoticeText;

		const editLink = ( name ) => domainManagementEdit( this.props.selectedSite.slug, name );
		if ( severity === 'is-error' ) {
			fullContent = (
				<span>
					{ translate(
						'Your domains may be suspended because your email address is not verified.'
					) }
					<ul>
						{ domains.map( ( { name } ) => (
							<li key={ name }>
								{ name } <a href={ editLink( name ) }>{ action }</a>
							</li>
						) ) }
					</ul>
				</span>
			);
			compactNoticeText = translate( 'Issues with your domains' );
			compactContent = (
				<NoticeAction href={ domainManagementList( this.props.selectedSite.slug ) }>
					{ action }
				</NoticeAction>
			);
		} else if ( severity === 'is-info' ) {
			fullContent = (
				<span>
					{ translate( 'Please verify ownership of domains:' ) }
					<ul>
						{ domains.map( ( { name } ) => (
							<li key={ name }>
								{ name } <a href={ editLink( name ) }>{ action }</a>
							</li>
						) ) }
					</ul>
				</span>
			);
			compactNoticeText = translate( 'Verification required for domains' );
			compactContent = (
				<NoticeAction href={ domainManagementList( this.props.selectedSite.slug ) }>
					{ action }
				</NoticeAction>
			);
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status={ severity }
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains-can-manage"
				text={ this.props.isCompact && compactNoticeText }
			>
				{ this.props.isCompact ? compactContent : fullContent }
			</Notice>
		);
	};

	unverifiedDomainsCannotManage = () => {
		const domains = this.getDomains().filter(
			( domain ) => domain.isPendingIcannVerification && ! domain.currentUserCanManage
		);

		if ( domains.length === 0 ) {
			return null;
		}

		const { translate } = this.props;
		const compactContent = (
			<NoticeAction href={ domainManagementList( this.props.selectedSite.slug ) }>
				{ translate( 'More' ) }
			</NoticeAction>
		);

		if ( domains.length === 1 ) {
			const fullMessage = translate(
					'The domain {{strong}}%(domain)s{{/strong}} may be suspended because the owner, ' +
						'{{strong}}%(owner)s{{/strong}}, has not verified their contact information.',
					{
						components: { strong: <strong /> },
						args: {
							domain: domains[ 0 ].name,
							owner: domains[ 0 ].owner,
						},
					}
				),
				compactMessage = translate( 'Issues with {{strong}}%(domain)s{{/strong}}', {
					components: { strong: <strong /> },
					args: { domain: domains[ 0 ].name },
				} );
			return (
				<Notice
					isCompact={ this.props.isCompact }
					showDismiss={ false }
					className="domain-warnings__notice"
					key="unverified-domains-cannot-manage"
					text={ this.props.isCompact ? compactMessage : fullMessage }
				>
					{ this.props.isCompact && compactContent }
				</Notice>
			);
		}

		const fullContent = (
				<span>
					{ translate(
						'Some domains on this site are about to be suspended because their owner has not ' +
							'verified their contact information.'
					) }
					<ul>
						{ domains.map( ( domain ) => {
							return <li key={ domain.name }>{ domain.name }</li>;
						} ) }
					</ul>
				</span>
			),
			compactNoticeText = translate( 'Issues with domains on this site' );

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains-cannot-manage"
				text={ this.props.isCompact && compactNoticeText }
			>
				{ this.props.isCompact ? compactContent : fullContent }
			</Notice>
		);
	};

	pendingGSuiteTosAcceptanceDomains = () => {
		const pendingDomains = this.getDomains().filter( hasPendingGSuiteUsers );
		return (
			pendingDomains.length !== 0 && (
				<PendingGSuiteTosNotice
					isCompact={ this.props.isCompact }
					key="pending-gsuite-tos-notice"
					siteSlug={ this.props.selectedSite && this.props.selectedSite.slug }
					domains={ pendingDomains }
					section="domain-management"
				/>
			)
		);
	};

	pendingTransfer = () => {
		const domain = find( this.getDomains(), 'pendingTransfer' );
		if ( ! domain ) {
			return null;
		}

		const { translate } = this.props;
		const compactNotice = translate( '{{strong}}%(domain)s{{/strong}} is pending transfer.', {
				components: { strong: <strong /> },
				args: { domain: domain.name },
			} ),
			fullNotice = translate(
				'{{strong}}%(domain)s{{/strong}} is pending transfer. ' +
					'You must wait for the transfer to finish, and then update the settings at the new registrar.',
				{
					components: { strong: <strong /> },
					args: { domain: domain.name },
				}
			);

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-warning"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="pending-transfer"
				text={ this.props.isCompact && compactNotice }
			>
				{ ! this.props.isCompact && fullNotice }
			</Notice>
		);
	};

	transferStatus = () => {
		const domainInTransfer = find(
			this.getDomains(),
			( domain ) => domain.type === domainTypes.TRANSFER
		);

		if ( ! domainInTransfer ) {
			return null;
		}

		const { isCompact, translate, moment } = this.props;

		let status = 'is-warning';
		let compactMessage = null;
		let message;

		const domainManagementLink = domainManagementTransferIn(
			this.props.selectedSite.slug,
			domainInTransfer.name
		);

		const action = (
			<NoticeAction href={ domainManagementLink }>{ translate( 'Info' ) }</NoticeAction>
		);

		switch ( domainInTransfer.transferStatus ) {
			case transferStatus.PENDING_OWNER: {
				compactMessage = translate( 'Transfer confirmation required' );

				const translateParams = {
					components: {
						strong: <strong />,
						a: <a href={ domainManagementLink } rel="noopener noreferrer" />,
					},
					args: { domain: domainInTransfer.name },
				};

				if ( domainInTransfer.adminEmail ) {
					translateParams.args.email = domainInTransfer.adminEmail;
					message = translate(
						'We sent an email to {{strong}}%(email)s{{/strong}} to confirm the transfer of ' +
							'{{strong}}%(domain)s{{/strong}}. {{a}}More Info{{/a}}',
						translateParams
					);
				} else {
					message = translate(
						"We'll send an email shortly to confirm the transfer of {{strong}}%(domain)s{{/strong}}. {{a}}More Info{{/a}}",
						translateParams
					);
				}
				break;
			}
			case transferStatus.PENDING_REGISTRY:
				message = translate(
					'The transfer of {{strong}}%(domain)s{{/strong}} is in progress. We are waiting ' +
						'for authorization from your current domain provider to proceed. {{a}}Learn more{{/a}}',
					{
						components: {
							strong: <strong />,
							a: (
								<a
									href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
						args: {
							domain: domainInTransfer.name,
						},
					}
				);

				if ( domainInTransfer.transferEndDate ) {
					message = translate(
						'The transfer of {{strong}}%(domain)s{{/strong}} is in progress. ' +
							'It should complete by %(transferFinishDate)s. We are waiting ' +
							'for authorization from your current domain provider to proceed. {{a}}Learn more{{/a}}',
						{
							components: {
								strong: <strong />,
								a: (
									<a
										href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							},
							args: {
								domain: domainInTransfer.name,
								transferFinishDate: moment( domainInTransfer.transferEndDate ).format( 'LL' ),
							},
						}
					);
				}
				break;
			case transferStatus.PENDING_START:
				compactMessage = translate( 'Domain transfer waiting' );
				message = translate(
					'Your domain {{strong}}%(domain)s{{/strong}} is waiting for you to start the transfer. {{a}}More info{{/a}}',
					{
						components: {
							strong: <strong />,
							a: (
								<a
									href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
						args: { domain: domainInTransfer.name },
					}
				);
				break;
			case transferStatus.CANCELLED:
				status = 'is-error';
				compactMessage = translate( 'Domain transfer failed' );
				message = translate(
					'The transfer of {{strong}}%(domain)s{{/strong}} has failed. {{a}}More info{{/a}}',
					{
						components: {
							strong: <strong />,
							a: <a href={ domainManagementLink } rel="noopener noreferrer" />,
						},
						args: { domain: domainInTransfer.name },
					}
				);
				break;
		}

		// If no message set, no notice for current state
		if ( ( isCompact && ! compactMessage ) || ( ! isCompact && ! message ) ) {
			return null;
		}

		return (
			<Notice
				isCompact={ isCompact }
				status={ status }
				showDismiss={ false }
				className="domain-warnings__notice"
				key="transfer-status"
				text={ isCompact && compactMessage }
			>
				{ isCompact ? compactMessage && action : message }
			</Notice>
		);
	};

	pendingConsent = () => {
		const pendingConsentDomains = this.getDomains().filter(
			( domain ) =>
				domain.type === domainTypes.REGISTERED &&
				gdprConsentStatus.PENDING_ASYNC === domain.gdprConsentStatus
		);

		if ( 0 === pendingConsentDomains.length ) {
			return null;
		}

		const { isCompact, translate, selectedSite } = this.props;
		let noticeText;

		if ( pendingConsentDomains.length === 1 ) {
			const currentDomain = pendingConsentDomains[ 0 ].name;
			const translateOptions = {
				components: {
					strong: <strong />,
					a: (
						<a
							href={ domainManagementManageConsent( selectedSite.slug, currentDomain ) }
							rel="noopener noreferrer"
						/>
					),
				},
				args: {
					domain: currentDomain,
				},
			};

			if ( isCompact ) {
				noticeText = translate(
					'The domain {{strong}}%(domain)s{{/strong}} requires explicit user consent to complete the registration.',
					translateOptions
				);
			} else {
				noticeText = translate(
					'The domain {{strong}}%(domain)s{{/strong}} is still pending registration. Please check the domain owner email since explicit consent is required for the registration to complete or go to the {{a}}Consent Management{{/a}} page for more details.',
					translateOptions
				);
			}
		} else if ( isCompact ) {
			noticeText = translate(
				'Some domains require explicit user consent to complete the registration.'
			);
		} else {
			noticeText = translate(
				'Some domains are still pending registration. Please check the domain owner email to give explicit consent before the registration can be completed.'
			);
		}

		return (
			<Notice
				isCompact={ isCompact }
				status="is-error"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="pending-consent"
			>
				{ noticeText }
			</Notice>
		);
	};

	UNSAFE_componentWillMount() {
		if ( ! this.props.domains && ! this.props.domain ) {
			debug( 'You need provide either "domains" or "domain" property to this component.' );
		}
	}

	render() {
		debug( 'Domains:', this.getDomains() );
		const notices = this.getPipe()
			.map( ( renderer ) => renderer() )
			.filter( ( notice ) => notice );
		return notices.length ? <div>{ notices }</div> : null;
	}
}

const mapStateToProps = null;
const mapDispatchToProps = { recordTracksEvent };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( DomainWarnings ) ) );
