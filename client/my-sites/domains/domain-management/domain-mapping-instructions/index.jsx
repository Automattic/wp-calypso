/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isSubdomain } from 'calypso/lib/domains';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
	MAP_SUBDOMAIN,
} from 'calypso/lib/url/support';
import { WPCOM_DEFAULT_NAMESERVERS } from 'calypso/state/domains/nameservers/constants';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { Notice } from 'calypso/components/notice';
import ExternalLink from 'calypso/components/external-link';

/**
 * Style dependencies
 */
import './style.scss';

class DomainMappingInstructions extends React.Component {
	static propTypes = {
		domain: PropTypes.object,
		isAtomic: PropTypes.bool,
		isLoaded: PropTypes.bool,
	};

	static defaultProps = {
		isAtomic: false,
		isLoaded: false,
	};

	renderARecordsList() {
		const { domain, isLoaded } = this.props;

		if ( isLoaded ) {
			return (
				<ul className="domain-mapping-instructions__dns-records-list-placeholder">
					<li></li>
					<li></li>
				</ul>
			);
		}
		return (
			<ul className="domain-mapping-instructions__dns-records-list">
				{ domain?.aRecordsRequiredForMapping.map( ( aRecord ) => {
					return <li key={ aRecord }>{ aRecord }</li>;
				} ) }
			</ul>
		);
	}

	renderARecordsMappingMessage() {
		const { translate } = this.props;

		const advancedSetupUsingARecordsTitle = translate( 'Advanced setup using root A records' );
		const aRecordMappingWarning = translate(
			'If you map a domain using A records rather than WordPress.com name servers, you will need to manage your domain’s DNS records yourself for any other services you are using with your domain, including email forwarding or email hosting (i.e. with Google Workspace or Titan)'
		);
		const aRecordsSetupMessage = translate(
			'Please set the following IP addresses as root A records using {{link}}these instructions{{/link}}:',
			{
				components: {
					link: <ExternalLink href={ MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS } target="_blank" />,
				},
			}
		);
		return (
			<FoldableFAQ id="advanced-mapping-setup" question={ advancedSetupUsingARecordsTitle }>
				<Notice status="is-warning" showDismiss={ false } translate={ this.props.translate }>
					{ aRecordMappingWarning }
				</Notice>
				<p>{ aRecordsSetupMessage }</p>
				{ this.renderARecordsList() }
			</FoldableFAQ>
		);
	}

	getRecommendedSetupMessage() {
		const { domain, translate } = this.props;

		if ( isSubdomain( domain?.name ) ) {
			return translate(
				'Please create the correct CNAME or NS records at your current DNS provider. {{learnMoreLink}}Learn how to do that in our support guide for mapping subdomains{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <ExternalLink href={ MAP_SUBDOMAIN } target="_blank" />,
					},
				}
			);
		}

		return translate(
			'Please log into your account at your domain registrar and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: <ExternalLink href={ MAP_DOMAIN_CHANGE_NAME_SERVERS } target="_blank" />,
				},
			}
		);
	}

	renderRecommendedSetupMessage() {
		const { domain, translate } = this.props;

		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				<p>{ this.getRecommendedSetupMessage() }</p>
				{ ! isSubdomain( domain?.name ) && (
					<ul className="domain-mapping-instructions__name-server-list">
						{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
							return <li key={ nameServer }>{ nameServer }</li>;
						} ) }
					</ul>
				) }
			</FoldableFAQ>
		);
	}

	render() {
		const { domain } = this.props;
		return (
			<div className="domain-mapping-instructions">
				{ this.renderRecommendedSetupMessage() }
				{ domain?.aRecordsRequiredForMapping && this.renderARecordsMappingMessage() }
			</div>
		);
	}
}

export default localize( DomainMappingInstructions );
