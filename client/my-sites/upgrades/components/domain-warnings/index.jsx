/**
 * External Dependencies
 **/
import React from 'react';
import _debug from 'debug';
import moment from 'moment';
import intersection from 'lodash/intersection';
import map from 'lodash/map';
import every from 'lodash/every';

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

const allAboutDomainsLink = <a href={ support.ALL_ABOUT_DOMAINS } target="_blank"/>,
	domainsLink = <a href={ support.DOMAINS } target="_blank" />,
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
				'expiredDomains',
				'expiringDomains',
				'unverifiedDomains',
				'pendingGappsToAcceptanceDomains',
				'wrongNSMappedDomains',
				'newDomains'
			]
		}
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
			<NoticeAction href={ purchasesPaths.list() }>
				{ this.props.isCompact ? compactMessage : fullMessage }
			</NoticeAction>
		);
	},

	getPipe() {
		const allRules = [
				this.expiredDomains,
				this.expiringDomains,
				this.unverifiedDomains,
				this.pendingGappsTosAcceptanceDomains,
				this.wrongNSMappedDomains,
				this.newDomains
			],
			validRules = this.props.ruleWhiteList.map( ruleName => this[ ruleName ] );

		return intersection( allRules, validRules );
	},

	getDomains() {
		return ( this.props.domains || [ this.props.domain ] ).filter( domain => domain.currentUserCanManage );
	},

	wrongNSMappedDomains() {
		debug( 'Rendering wrongNSMappedDomains' );

		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			return null;
		}

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
				text = this.translate( '%(domainName)s\'s CNAME records should be configured.', {
					args: { domainName: domain.name },
					context: 'Notice for mapped subdomain that has CNAME records need to set up'
				} );
				learnMoreUrl = support.MAP_SUBDOMAIN;
			} else {
				text = this.translate( '%(domainName)s\'s name server records should be configured.', {
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
			status: "is-warning",
			className: "domain-warnings__notice",
			showDismiss: false,
			key: "wrong-ns-mapped-domain"
		};
		let children;
		if ( this.props.isCompact ) {
			noticeProps.text = this.translate( 'DNS configuration required' );
			children = <NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>{ this.translate( 'Fix' ) }</NoticeAction>;
		} else {
			children = <span>{ text } <a href={ learnMoreUrl } target="_blank">{ this.translate( 'Learn more' ) }</a>{ offendingList }</span>;
		}
		return <Notice { ...noticeProps }>{ children }</Notice>;
	},

	expiredDomains() {
		debug( 'Rendering expiredDomain' );
		const expiredDomains = this.getDomains().filter( domain => domain.expired && domain.type === domainTypes.REGISTERED );
		let text, renewLink;
		if ( expiredDomains.length === 0 ) {
			return null;
		} else if ( expiredDomains.length === 1 ) {
			text = this.translate( '%(domainName)s expired %(timeSince)s.', {
				args: { timeSince: expiredDomains[0].expirationMoment.fromNow(), domainName: expiredDomains[0].name },
				context: 'Expired domain notice',
				comment: '%(timeSince)s is something like "a year ago"'
			} );
		} else {
			text = this.translate( 'Some of your domains have expired.', {
				context: 'Expired domain notice'
			} );
		}
		renewLink = this.renewLink( expiredDomains.length );
		return <Notice
			isCompact={ this.props.isCompact }
			status="is-error"
			showDismiss={ false }
			key="expired-domains"
			text={ text }>{ renewLink }</Notice>;
	},

	expiringDomains() {
		debug( 'Rendering expiringDomain' );
		const expiringDomains = this.getDomains().filter( domain => domain.expirySoon && domain.type === domainTypes.REGISTERED );
		let text, renewLink;

		if ( expiringDomains.length === 0 ) {
			return null;
		} else if ( expiringDomains.length === 1 ) {
			text = this.translate( '%(domainName)s is expiring %(timeUntil)s.', {
				args: { timeUntil: expiringDomains[0].expirationMoment.fromNow(), domainName: expiringDomains[0].name },
				context: 'Expiring soon domain notice',
				comment: '%(timeUntil)s is something like "in a week"'
			} );
		} else {
			text = this.translate( 'Some of your domains are expiring soon.', {
				context: 'Expiring domain notice'
			} );
		}
		renewLink = this.renewLink( expiringDomains.length );
		return <Notice
			isCompact={ this.props.isCompact }
			status="is-error"
			showDismiss={ false }
			key="expiring-domains"
			text={ text }>{ renewLink }</Notice>;
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
			const domain = newDomains[0];
			if ( hasNewPrimaryDomain ) {
				text = this.translate( '{{pNode}}We are setting up %(domainName)s for you. It should start working immediately, ' +
					'but may be unreliable during the first 72 hours.{{/pNode}}' +
					'{{pNode}}If you are unable to access your site at %(domainName)s, try setting the primary domain to a domain you' +
					' know is working. {{domainsLink}}Learn more{{/domainsLink}} about setting the primary domain, or ' +
					'{{tryNowLink}}try %(domainName)s now.{{/tryNowLink}}{{/pNode}}',
					{
						args: { domainName: domain.name },
						components: {
							domainsLink,
							pNode,
							tryNowLink: <a href={ `http://${domain.name}` } target="_blank"/>
						}
					}
				);
			} else {
				text = this.translate( 'We are setting up %(domainName)s for you. It should start working immediately, ' +
					'but may be unreliable during the first 72 hours. ' +
					'{{allAboutDomainsLink}}Learn more{{/allAboutDomainsLink}} about your new domain, or {{tryNowLink}} try it now{{/tryNowLink}}.',
					{
						args: { domainName: domain.name },
						components: {
							allAboutDomainsLink,
							tryNowLink: <a href={ `http://${domain.name}` } target="_blank"/>
						}
					}
				);
			}
		}

		return <Notice
			isCompact={ this.props.isCompact }
			status="is-warning"
			showDismiss={ false }
			key="new-domains">{ text }</Notice>;
	},

	unverifiedDomainNotice( domain ) {
		const fullMessage = this.translate( 'Urgent! Your domain %(domain)s may be lost forever because your email address is not verified.', { args: { domain } } ),
			compactMessage = this.translate( '%(domain)s may be suspended.', { args: { domain } } );
		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains"
				text={ this.props.isCompact ? compactMessage : fullMessage }>
				<NoticeAction href={ paths.domainManagementEdit( this.props.selectedSite.slug, domain ) }>
					{ this.translate( 'Fix' ) }
				</NoticeAction>
			</Notice>
		);
	},

	unverifiedDomainsNotice( domains ) {
		const fullContent = (
				<span>
					{ this.translate( 'Urgent! Some of your domains may be lost forever because your email address is not verified.' ) }
					<ul>
						{ domains.map( ( { name } ) =>
							<li key={ name }>{ name } <a href={ paths.domainManagementEdit( this.props.selectedSite.slug, name ) }>{ this.translate( 'Fix now' ) }</a></li>
						) }
					</ul>
				</span>
			),
			compactNoticeText = this.translate( 'Your domains may be suspended.' ),
			compactContent = (
				<NoticeAction href={ paths.domainManagementList( this.props.selectedSite.slug ) }>
					{ this.translate( 'Fix' ) }
				</NoticeAction>
			);
		return (
			<Notice
				isCompact={ this.props.isCompact }
				status="is-error"
				showDismiss={ false }
				className="domain-warnings__notice"
				key="unverified-domains"
				text={ this.props.isCompact && compactNoticeText } >
				{ this.props.isCompact ? compactContent: fullContent }
			</Notice>
		);
	},

	unverifiedDomains() {
		const domains = this.getDomains().filter( domain => domain.isPendingIcannVerification );

		if ( domains.length === 1 ) {
			return this.unverifiedDomainNotice( domains[0].name );
		} else if ( domains.length ) {
			return this.unverifiedDomainsNotice( domains );
		}
		return null;
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
