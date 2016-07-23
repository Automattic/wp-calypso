/**
 * External Dependencies
 **/
import React from 'react';
import _debug from 'debug';
import moment from 'moment';
import intersection from 'lodash/intersection';

/**
 * Internal Dependencies
 **/
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import PendingGappsTosNotice from './pending-gapps-tos-notice';
import purchasesPaths from 'me/purchases/paths';
import domainConstants from 'lib/domains/constants';
import support from 'lib/url/support';
import paths from 'my-sites/upgrades/paths';

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
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	renewLink( count ) {
		return (
			<a href={ purchasesPaths.list() }>
				{ this.translate(
					'Renew it now.',
					'Renew them now.',
					{
						count,
						context: 'Call to action link for renewing an expiring/expired domain'
					}
				) }
			</a>
		);
	},

	getPipe() {
		const allRules = [ this.expiredDomains, this.expiringDomains, this.newDomains, this.unverifiedDomains, this.pendingGappsTosAcceptanceDomains ];
		let rules;

		if ( ! this.props.ruleWhiteList ) {
			rules = allRules;
		} else {
			const validRules = this.props.ruleWhiteList.map( ruleName => this[ ruleName ] );
			rules = intersection( allRules, validRules ); // avoid leaking other functions
		}
		return rules;
	},

	getDomains() {
		return ( this.props.domains || [ this.props.domain ] ).filter( domain => domain.currentUserCanManage );
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
		return <Notice status="is-error" showDismiss={ false } key="expired-domains">{ text } { renewLink }</Notice>;
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
		return <Notice status="is-error" showDismiss={ false } key="expiring-domains">{ text } { renewLink }</Notice>;
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

		return <Notice status="is-warning" showDismiss={ false } key="new-domains">{ text }</Notice>;
	},

	unverifiedDomainNotice( domain ) {
		return (
			<Notice
				status="is-error"
				showDismiss={ false }
				className="domain-warnings__unverified-domains"
				key="unverified-domains"
				text={ this.translate( 'Urgent! Your domain %(domain)s may be lost forever because your email address is not verified.', { args: { domain } } ) }>

				<NoticeAction href={ paths.domainManagementEdit( this.props.selectedSite.slug, domain ) }>
					{ this.translate( 'Fix now' ) }
				</NoticeAction>
			</Notice>
		);
	},

	unverifiedDomainsNotice( domains ) {
		return (
			<Notice status="is-error" showDismiss={ false } className="domain-warnings__unverified-domains" key="unverified-domains">
				{ this.translate( 'Urgent! Some of your domains may be lost forever because your email address is not verified:' ) }
				<ul>{
					domains.map( ( domain ) => {
						return <li key={ domain.name }>
							{ domain.name } <a href={ paths.domainManagementEdit( this.props.selectedSite.slug, domain.name ) }>{ this.translate( 'Fix now' ) }</a>
						</li>;
					} )
				}</ul>
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
		const pendingDomains = this.getDomains().filter( domain =>
				domain.googleAppsSubscription &&
				domain.googleAppsSubscription.pendingUsers &&
				domain.googleAppsSubscription.pendingUsers.length !== 0 );
		return pendingDomains.length !== 0 && <PendingGappsTosNotice key="pending-gapps-tos-notice" siteSlug={ this.props.selectedSite && this.props.selectedSite.slug } domains={ pendingDomains } section="domain-management" />;
	},

	componentWillMount: function() {
		if ( ! this.props.domains || ! this.props.domain ) {
			debug( 'You need provide either "domains" or "domain" property to this component.' );
		}
	},
	render: function() {
		const notices = this.getPipe().map( renderer => renderer() ).filter( notice => notice );
		return notices.length ? <div>{ notices }</div> : null;
	}

} );
