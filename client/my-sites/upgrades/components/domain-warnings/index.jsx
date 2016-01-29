/**
 * External Dependencies
 **/
import React from 'react';
import _debug from 'debug';
import moment from 'moment';
import intersection from 'lodash/array/intersection';

/**
 * Internal Dependencies
 **/
import Notice from 'components/notice';
import purchasesPaths from 'me/purchases/paths';
import domainConstants from 'lib/domains/constants';
import i18n from 'lib/mixins/i18n';
import paths from 'my-sites/upgrades/paths';

const domainTypes = domainConstants.type;
const debug = _debug( 'calypso:domain-warnings' );

const allAboutDomainsLink = <a href="https://support.wordpress.com/all-about-domains/" target="_blank"/>,
	domainsLink = <a href="https://support.wordpress.com/domains/" target="_blank" />,
	pNode = <p />,
	renewLinkSingle = <a href={ purchasesPaths.list() }>{ i18n.translate( 'Renew it now.', { context: 'Call to action link for renewing an expiring/expired domain' } ) }</a>,
	renewLinkPlural = <a href={ purchasesPaths.list() }>{ i18n.translate( 'Renew them now.', { context: 'Call to action link for renewing an expiring/expired domain' } ) }</a>;

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

	getPipe() {
		let allRules = [ this.expiredDomains, this.expiringDomains, this.newDomainsWithPrimary, this.newDomains, this.unverifiedDomains ],
			rules;
		if ( ! this.props.ruleWhiteList ) {
			rules = allRules;
		} else {
			let validRules = this.props.ruleWhiteList.map( ruleName => this[ ruleName ] );
			rules = intersection( allRules, validRules ); // avoid leaking other functions
		}
		return rules;
	},

	getDomains() {
		return this.props.domains || [ this.props.domain ]
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
			renewLink = renewLinkSingle;
		} else {
			text = this.translate( 'Some of your domains have expired.', {
				context: 'Expired domain notice'
			} );
			renewLink = renewLinkPlural;
		}
		return <Notice status="is-error" showDismiss={ false } key="expiredDomains">{ text } { renewLink }</Notice>
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
			renewLink = renewLinkSingle;
		} else {
			text = this.translate( 'Some of your domains are expiring soon.', {
				context: 'Expiring domain notice'
			} );
			renewLink = renewLinkPlural;
		}
		return <Notice status="is-error" showDismiss={ false } key="expiringDomains">{ text } { renewLink }</Notice>;
	},

	unverifiedDomains() {
		var notices,
			domains = this.getDomains().filter( domain => domain.isPendingIcannVerification );

		if ( domains.length > 2 ) {
			notices = <Notice status="is-error" showDismiss={ false } key="unverifiedDomains">{
				this.translate( 'Some of your domains have unverified email addresses. This may lead to their temporary suspension.' )
			}</Notice>;
		} else if ( domains.length > 0 ) {
			notices = domains.map( domain => {
				const text = this.translate( 'You need to verify the email for %(domainName)s or the domain may be suspended. {{a}}Learn more.{{/a}}', {
					args: {
						domainName: domain.name
					},
					components: {
						a: <a href={ paths.domainManagementEdit( this.props.selectedSite.domain, domain.name ) } />
					}
				} );
				return <Notice status="is-error" showDismiss={ false } key={ 'unverifiedDomains' + domain.name }>{ text }</Notice>;
			} );
		}

		return notices ? <div key="unverifiedDomains">{ notices }</div> : null;
	},

	newDomainsWithPrimary() {
		debug( 'Rendering newDomainsWithPrimary' );
		let newDomains = this.getDomains().filter( ( domain ) =>
			domain.registrationMoment && moment( domain.registrationMoment ).add( 3, 'days' ).isAfter( moment() ) && domain.type === domainTypes.REGISTERED ),
			hasNewPrimaryDomain = newDomains.some( ( domain ) => this.props.selectedSite.domain === domain.name ),
			text;

		if ( ! hasNewPrimaryDomain || newDomains.length === 0 ) {
			return null;
		}

		if ( newDomains.length > 1 ) {
			// Multiple new domains, one is primary
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
			// One new domain and is primary
			let domain = newDomains[0];
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
		}

		return <Notice status="is-warning" showDismiss={ false } key="newPrimary">{ text }</Notice>;
	},

	newDomains() {
		let newDomains = this.getDomains().filter( ( domain ) =>
			domain.registrationMoment && moment( domain.registrationMoment ).add( 3, 'days' ).isAfter( moment() ) && domain.type === domainTypes.REGISTERED ),
			text;

		if ( newDomains.length === 0 ) {
			return null;
		}

		if ( newDomains.length > 1 ) {
			text = this.translate( 'We are setting up your new domains for you. They should start working immediately, ' +
				'but may be unreliable during the first 72 hours. ' +
				'{{allAboutDomainsLink}}Learn more{{/allAboutDomainsLink}}.', { components: { allAboutDomainsLink } } );
		} else {
			let domain = newDomains[0];
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
		return <Notice status="is-warning" showDismiss={ false } key="newDomains">{ text }</Notice>;
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
