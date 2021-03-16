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
		aRecordsRequiredForMapping: PropTypes.array,
		areDomainDetailsLoaded: PropTypes.bool,
		domainName: PropTypes.string,
		isAtomic: PropTypes.bool,
	};

	static defaultProps = {
		areDomainDetailsLoaded: false,
		isAtomic: false,
	};

	renderARecordsList() {
		const { aRecordsRequiredForMapping } = this.props;
		return (
			<ul className="mapping-instructions__dns-records-list">
				{ aRecordsRequiredForMapping.map( ( aRecord ) => {
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
		const { domainName, translate } = this.props;

		if ( isSubdomain( domainName ) ) {
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
		const { domainName, translate } = this.props;

		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				<p>{ this.getRecommendedSetupMessage() }</p>
				{ ! isSubdomain( domainName ) && (
					<ul className="mapping-instructions__name-server-list">
						{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
							return <li key={ nameServer }>{ nameServer }</li>;
						} ) }
					</ul>
				) }
			</FoldableFAQ>
		);
	}

	renderPlaceholder() {
		return (
			<div className="mapping-instructions__placeholder">
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
			</div>
		);
	}

	render() {
		const { aRecordsRequiredForMapping, areDomainDetailsLoaded } = this.props;

		if ( ! areDomainDetailsLoaded ) {
			return this.renderPlaceholder();
		}

		return (
			<div className="mapping-instructions">
				{ this.renderRecommendedSetupMessage() }
				{ aRecordsRequiredForMapping && this.renderARecordsMappingMessage() }
			</div>
		);
	}
}

export default localize( DomainMappingInstructions );
