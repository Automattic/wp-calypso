/**
 * External Dependencies
 **/
import React from 'react';
import _debug from 'debug';
import moment from 'moment';
import { intersection, map, every, find } from 'lodash';

/**
 * Internal Dependencies
 **/
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import PendingGappsTosNotice from './pending-gapps-tos-notice';
import purchasesPaths from 'me/purchases/paths';
import domainConstants from 'lib/domains/constants';
import { isSubdomain } from 'lib/domains';
import support from 'lib/url/support';
import paths from 'my-sites/upgrades/paths';
import { hasPendingGoogleAppsUsers } from 'lib/domains';

const domainTypes = domainConstants.type;
const debug = _debug( 'calypso:domain-warnings' );

const allAboutDomainsLink = <a href={ support.ALL_ABOUT_DOMAINS } target="_blank" rel="noopener noreferrer" />,
	domainsLink = <a href={ support.DOMAINS } target="_blank" rel="noopener noreferrer" />,
	pNode = <p />;

export default React.createClass( {
	displayName: 'DomainWarnings',
	propTypes: {
		domains: React.PropTypes.array,
		ruleWhiteList: React.PropTypes.array,
		domain: React.PropTypes.object,
		isCompact: React.PropTypes.bool,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getDefaultProps() {
		return {
			isCompact: false,
			ruleWhiteList: [
				'expiredDomainsCanManage',
				'expiringDomainsCanManage',
				'unverifiedDomainsCanManage',
				'pendingGappsTosAcceptanceDomains',
				'expiredDomainsCannotManage',
				'expiringDomainsCannotManage',
				'unverifiedDomainsCannotManage',
				'wrongNSMappedDomains',
				'newDomains'
			]
		};
	},

	renewLink( count ) {
		const fullMessage = this.translate(
			'Renew it now.',
			'Renew them now.',
			{
				count,
				context: 'Call to action link for renewing an expiring/expired domain'
			}
		),
			compactMessage = this.translate( 'Renew', { context: 'Call to action link for renewing an expiring/expired domain' } );
		return (
			<NoticeAction href={ purchasesPaths.purchasesRoot() }>
				{ this.props.isCompact ? compactMessage : fullMessage }
			</NoticeAction>
		);
	},

	getPipe() {
		const allRules = [
				this.expiredDomainsCanManage,
				this.expiringDomainsCanManage,
				this.unverifiedDomainsCanManage,
				this.unverifiedDomainsCannotManage,
				this.pendingGappsTosAcceptanceDomains,
				this.expiredDomainsCannotManage,
				this.expiringDomainsCannotManage,
				this.wrongNSMappedDomains,
				this.newDomains,
				this.pendingTransfer
			],
			validRules = this.props.ruleWhiteList.map( ruleName => this[ ruleName ] );

		return intersection( allRules, validRules );
	},

	getDomains() {
		return ( this.props.domains || [ this.props.domain ] );
	},

	wrongNSMappedDomains() {
		debug( 'Rendering wrongNSMappedDomains' );

		const wrongMappedDomains = this.getDomains().filter( domain =>
			domain.type === domainTypes.MAPPED && ! domain.pointsToWpcom );

		debug( 'NS error domains:', wrongMappedDomains );
		let learnMoreUrl,
			text,
			offendingList = null;

		if ( wrongMappedDomains.length === 0 ) {
			return null;
		}

		if ( wrongMappedDomains.length === 1 ) {
			const domain = wrongMappedDomains[ 0 ];
			if ( isSubdomain( domain.name ) ) {
				text = this.translate( '{{strong}}%(domainName)s\'s{{/strong}} CNAME records should be configured.', {
					components: { strong: <strong /> },
					args: { domainName: domain.name },
					context: 'Notice for mapped subdomain that has CNAME records need to set up'
				} );
				learnMoreUrl = support.MAP_SUBDOMAIN;
			} else {
				text = this.translate( '{{strong}}%(domainName)s\'s{{/strong}} name server records should be configured.', {
					components: { strong: <strong /> },
					args: { domainName: domain.name },
					context: 'Notice for mapped domain notice with NS records pointing to somewhere else'
				} );
				learnMoreUrl = support.DOMAIN_HELPER_PREFIX + domain.name;
			}
		} else {
			offendingList = <ul>{ wrongMappedDomains.map( domain => <li key={ domain.name }>{ domain.name }</li> ) }</ul>;
			if ( every( map( wrongMappedDomains, 'name' ), isSubdomain ) ) {
				text = this.translate( 'Some of your domains\' CNAME records should be configured.', {
					context: 'Notice for mapped subdomain that has CNAME records need to set up'
				} );
				learnMoreUrl = support.MAP_SUBDOMAIN;
			} else {
				text = this.translate( 'Some of your domains\' name server records should be configured.', {
					context: 'Mapped domain notice with NS records pointing to somewhere else'
				} );
				learnMoreUrl = support.MAP_EXISTING_DOMAIN_UPDATE_DNS;
			}
		}
		const noticeProps = {
			isCompact: this.props.isCompact,
			status: 'is-warning',
			className: 'domain-warnings__notice',
			showDismiss: false,
			key: 'wrong-ns-mapped-domain'
		};
		let children;
		if ( this.props.isCompact ) {
			noticeProps.text = this.translate( 'DNS configuration required' );
			children = <NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>{ this.translate( 'Fix' ) }</NoticeAction>;
		} else {
			children = <span>{ text } <a href={ learnMoreUrl } target="_blank" rel="noopener noreferrer">{ this.translate( 'Learn more' ) }</a>{ offendingList }</span>;
		}
		return <Notice { ...noticeProps }>{ children }</Notice>;
	},

	expiredDomainsCanManage() {
		debug( 'Rendering expiredDomainsCanManage' );
		let text;
		const expiredDomains = this.getDomains().filter( domain => domain.expired && domain.type === domainTypes.REGISTERED && domain.currentUserCanManage ),
			renewLink = this.renewLink( expiredDomains.length );

		if ( expiredDomains.length === 0 ) {
			return null;
		}

		if ( expiredDomains.length === 1 ) {
			text = this.translate( '{{strong}}%(domainName)s{{/strong}} expired %(timeSince)s.', {
				components: { strong: <strong /> },
				args: { timeSince: expiredDomains[ 0 ].expirationMoment.fromNow(), domainName: expiredDomains[ 0 ].name },
				context: 'Expired domain notice',
				comment: '%(timeSince)s is something like "a year ago"'
			} );
		} else {
			text = this.translate( 'Some of your domains have expired.', {
				context: 'Expired domain notice'
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				key="expired-domains-can-manage"
				text={ text }>
				{ renewLink }
			</Notice>
		);
	},

	expiredDomainsCannotManage() {
		let text;
		const expiredDomains = this.getDomains().filter( domain => domain.expired && domain.type === domainTypes.REGISTERED && ! domain.currentUserCanManage );

		if ( expiredDomains.length === 0 ) {
			return null;
		}

		if ( expiredDomains.length === 1 ) {
			text = this.translate( 'The domain {{strong}}%(domainName)s{{/strong}} expired %(timeSince)s. It can be renewed by the user {{strong}}%(owner)s{{/strong}}.', {
				components: { strong: <strong /> },
				args: {
					timeSince: expiredDomains[ 0 ].expirationMoment.fromNow(),
					domainName: expiredDomains[ 0 ].name,
					owner: expiredDomains[ 0 ].owner
				},
				context: 'Expired domain notice',
				comment: '%(timeSince)s is something like "a year ago"'
			} );
		} else {
			text = this.translate( 'Some domains on this site expired recently. They can be renewed by their owners.', {
				context: 'Expired domain notice'
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				key="expired-domains-cannot-manage"
				text={ text } />
		);
	},

	expiringDomainsCanManage() {
		let text;
		const expiringDomains = this.getDomains().filter( domain => domain.expirySoon && domain.type === domainTypes.REGISTERED && domain.currentUserCanManage ),
			renewLink = this.renewLink( expiringDomains.length );

		if ( expiringDomains.length === 0 ) {
			return null;
		}

		if ( expiringDomains.length === 1 ) {
			text = this.translate( '{{strong}}%(domainName)s{{/strong}} is expiring %(timeUntil)s.', {
				components: { strong: <strong /> },
				args: {
					timeUntil: expiringDomains[ 0 ].expirationMoment.fromNow(),
					domainName: expiringDomains[ 0 ].name
				},
				context: 'Expiring soon domain notice',
				comment: '%(timeUntil)s is something like "in a week"'
			} );
		} else {
			text = this.translate( 'Some of your domains are expiring soon.', {
				context: 'Expiring domain notice'
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				key="expiring-domains-can-manage"
				text={ text }>
				{ renewLink }
			</Notice>
		);
	},

	expiringDomainsCannotManage() {
		let text;
		const expiringDomains = this.getDomains().filter( domain => domain.expirySoon && domain.type === domainTypes.REGISTERED && ! domain.currentUserCanManage );

		if ( expiringDomains.length === 0 ) {
			return null;
		}

		if ( expiringDomains.length === 1 ) {
			text = this.translate( 'The domain {{strong}}%(domainName)s{{/strong}} will expire %(timeUntil)s. It can be renewed by the user {{strong}}%(owner)s{{/strong}}.', {
				components: { strong: <strong /> },
				args: {
					timeUntil: expiringDomains[ 0 ].expirationMoment.fromNow(),
					domainName: expiringDomains[ 0 ].name,
					owner: expiringDomains[ 0 ].owner
				},
				context: 'Expiring soon domain notice',
				comment: '%(timeUntil)s is something like "in a week"'
			} );
		} else {
			text = this.translate( 'Some domains on this site are about to expire. They can be renewed by their owners.', {
				context: 'Expiring domain notice'
			} );
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				key="expiring-domains-cannot-manage"
				text={ text } />
		);
	},

	newDomains() {
		const newDomains = this.getDomains().filter( ( domain ) =>
				domain.registrationMoment && moment( domain.registrationMoment ).add( 3, 'days' ).isAfter( moment() ) && domain.type === domainTypes.REGISTERED ),
			hasNewPrimaryDomain = newDomains.some( ( domain ) => this.props.selectedSite.domain === domain.name );
		let text;

		if ( newDomains.length === 0 ) {
			return null;
		}

		if ( newDomains.length > 1 ) {
			if ( hasNewPrimaryDomain ) {
				text = this.translate( '{{pNode}}We are setting up your new domains for you. They should start working immediately, ' +
					'but may be unreliable during the first 72 hours.{{/pNode}}' +
					'{{pNode}}If you are unable to access your site at %(primaryDomain)s, try setting the primary domain to a domain ' +
					'you know is working. {{domainsLink}}Learn more{{/domainsLink}} about setting the primary domain.{{/pNode}}',
					{
						args: { primaryDomain: this.props.selectedSite.domain },
						components: {
							pNode,
							domainsLink
						}
					}
				);
			} else {
				text = this.translate( 'We are setting up your new domains for you. They should start working immediately, ' +
					'but may be unreliable during the first 72 hours. ' +
					'{{allAboutDomainsLink}}Learn more{{/allAboutDomainsLink}}.', { components: { allAboutDomainsLink } } );
			}
		} else {
			const domain = newDomains[ 0 ];
			if ( hasNewPrimaryDomain ) {
				text = this.translate( '{{pNode}}We are setting up {{strong}}%(domainName)s{{/strong}} for you. It should start working immediately, ' +
					'but may be unreliable during the first 72 hours.{{/pNode}}' +
					'{{pNode}}If you are unable to access your site at {{strong}}%(domainName)s{{/strong}}, try setting the primary domain to a domain you' +
					' know is working. {{domainsLink}}Learn more{{/domainsLink}} about setting the primary domain, or ' +
					'{{tryNowLink}}try {{strong}}%(domainName)s{{/strong}} now.{{/tryNowLink}}{{/pNode}}',
					{
						args: { domainName: domain.name },
						components: {
							domainsLink,
							pNode,
							tryNowLink: <a href={ `http://${ domain.name }` } target="_blank" rel="noopener noreferrer" />,
							strong: <strong />
						}
					}
				);
			} else {
				text = this.translate( 'We are setting up {{strong}}%(domainName)s{{/strong}} for you. It should start working immediately, ' +
					'but may be unreliable during the first 72 hours. ' +
					'{{allAboutDomainsLink}}Learn more{{/allAboutDomainsLink}} about your new domain, or {{tryNowLink}} try it now{{/tryNowLink}}.',
					{
						args: { domainName: domain.name },
						components: {
							allAboutDomainsLink,
							tryNowLink: <a href={ `http://${ domain.name }` } target="_blank" rel="noopener noreferrer" />,
							strong: <strong />
						}
					}
				);
			}
		}

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-warning"
				showDismiss={ false }
				key="new-domains">{ text }
			</Notice>
		);
	},

	unverifiedDomainsCanManage() {
		const domains = this.getDomains().filter( domain => domain.isPendingIcannVerification && domain.currentUserCanManage );
		const severity = domains.some( ( { registrationMoment } ) =>
			registrationMoment && moment( registrationMoment )
				.add( 2, 'days' )
				.isAfter( moment() ) ) ? 'is-info' : 'is-error';

		if ( domains.length === 0 ) {
			return null;
		}

		if ( domains.length === 1 ) {
			const domain = domains[ 0 ].name;
			let fullMessage, compactMessage;
			if ( severity === 'is-error' ) {
				fullMessage = this.translate(
					'Your domain {{strong}}%(domain)s{{/strong}} may be suspended because your email address is not verified.',
					{
						components: { strong: <strong /> },
						args: { domain }
					} );
					compactMessage = this.translate(
						'Issues with {{strong}}%(domain)s{{/strong}}.',
						{
							components: { strong: <strong /> },
							args: { domain }
						} );
			} else if ( severity === 'is-info' ) {
				fullMessage = this.translate(
					'{{strong}}%(domain)s{{/strong}} needs to be verified. You should receive an email shortly with more information.',
					{
						components: { strong: <strong /> },
						args: { domain }
					} );
				compactMessage = this.translate(
					'Please verify {{strong}}%(domain)s{{/strong}}.',
					{
						components: { strong: <strong /> },
						args: { domain }
					} );
			}

			return (
				<Notice
					isCompact={ this.props.isCompact }
					status={ severity }
					showDismiss={ false }
					className="domain-warnings__notice"
					key="unverified-domains-can-manage"
					text={ this.props.isCompact ? compactMessage : fullMessage }>
					<NoticeAction href={ paths.domainManagementEdit( this.props.selectedSite.slug, domain ) }>
						{ this.translate( 'Fix' ) }
					</NoticeAction>
				</Notice>
			);
		}

		let fullContent, compactContent, compactNoticeText;

		if ( severity === 'is-error' ) {
			fullContent = (
					<span>
					{ this.translate( 'Your domain {{strong}}%(domain)s{{/strong}} may be suspended because your email address is not verified.' ) }
						<ul>
						{ domains.map( ( { name } ) =>
							<li key={ name }>{ name } <a href={ paths.domainManagementEdit( this.props.selectedSite.slug, name ) }>{ this.translate( 'Fix' ) }</a></li>
						) }
					</ul>
				</span>
				);
				compactNoticeText = this.translate( 'Issues with your domains.' );
				compactContent = (
					<NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>
						{ this.translate( 'Fix' ) }
					</NoticeAction>
				);
		} else if ( severity === 'is-info' ) {
			fullContent = (
				<span>
					{ this.translate( 'Please verify ownership of domains:' ) }
					<ul>
						{ domains.map( ( { name } ) =>
							<li key={ name }>{ name } <a href={ paths.domainManagementEdit( this.props.selectedSite.slug, name ) }>{ this.translate( 'Fix' ) }</a></li>
						) }
					</ul>
				</span>
			);
			compactNoticeText = this.translate( 'Verification required for domains.' );
			compactContent = (
				<NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>
					{ this.translate( 'Fix' ) }
				</NoticeAction>
			);
		}


		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains-can-manage"
				text={ this.props.isCompact && compactNoticeText }>
				{ this.props.isCompact ? compactContent : fullContent }
			</Notice>
		);
	},

	unverifiedDomainsCannotManage() {
		const domains = this.getDomains().filter( domain => domain.isPendingIcannVerification && ! domain.currentUserCanManage );

		if ( domains.length === 0 ) {
			return null;
		}

		const compactContent = (
			<NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>
				{ this.translate( 'More' ) }
			</NoticeAction>
		);

		if ( domains.length === 1 ) {
			const fullMessage = this.translate(
				'The domain {{strong}}%(domain)s{{/strong}} may be suspended because the owner, ' +
					'{{strong}}%(owner)s{{/strong}}, has not verified their contact information.',
				{
					components: { strong: <strong /> },
					args: {
						domain: domains[ 0 ].name,
						owner: domains[ 0 ].owner
					}
				}
				),
				compactMessage = this.translate(
					'Issues with {{strong}}%(domain)s{{/strong}}.',
					{
						components: { strong: <strong /> },
						args: { domain: domains[ 0 ].name }
					} );
			return (
				<Notice
					isCompact={ this.props.isCompact }
					showDismiss={ false }
					className="domain-warnings__notice"
					key="unverified-domains-cannot-manage"
					text={ this.props.isCompact ? compactMessage : fullMessage }>
					{ this.props.isCompact && compactContent }
				</Notice>
			);
		}

		const fullContent = (
				<span>
					{ this.translate( 'Some domains on this site are about to be suspended because their owner has not verified their contact information.' ) }
					<ul>{
						domains.map( ( domain ) => {
							return <li key={ domain.name }>{ domain.name }</li>;
						} )
					}</ul>
				</span>
			),
			compactNoticeText = this.translate( 'Issues with domains on this site.' );

		return (
			<Notice
				isCompact={ this.props.isCompact }
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains-cannot-manage"
				text={ this.props.isCompact && compactNoticeText }>
				{ this.props.isCompact ? compactContent : fullContent }
			</Notice>
		);
	},

	pendingGappsTosAcceptanceDomains() {
		const pendingDomains = this.getDomains().filter( hasPendingGoogleAppsUsers );
		return pendingDomains.length !== 0 && <PendingGappsTosNotice
				isCompact={ this.props.isCompact }
				key="pending-gapps-tos-notice"
				siteSlug={ this.props.selectedSite && this.props.selectedSite.slug }
				domains={ pendingDomains }
				section="domain-management" />;
	},

	pendingTransfer() {
		const domain = find( this.getDomains(), 'pendingTransfer' );

		if ( ! domain ) {
			return null;
		}

		const compactNotice = this.translate( '{{strong}}%(domain)s{{/strong}} is pending transfer.', {
				components: { strong: <strong /> },
				args: { domain: domain.name }
			} ),
			fullNotice = this.translate(
				'{{strong}}%(domain)s{{/strong}} is pending transfer. ' +
				'You must wait for the transfer to finish, and then update the settings at the new registrar.',
				{
					components: { strong: <strong /> },
					args: { domain: domain.name }
				} );

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-warning"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains"
				text={ this.props.isCompact && compactNotice }>
				{ ! this.props.isCompact && fullNotice }
			</Notice>
		);
	},

	componentWillMount: function() {
		if ( ! this.props.domains && ! this.props.domain ) {
			debug( 'You need provide either "domains" or "domain" property to this component.' );
		}
	},

	render: function() {
		debug( 'Domains:', this.getDomains() );
		const notices = this.getPipe().map( renderer => renderer() ).filter( notice => notice );
		return notices.length ? <div className="site__notices">{ notices }</div> : null;
	}
} );
