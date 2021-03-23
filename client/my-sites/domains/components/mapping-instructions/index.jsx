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
		wpcomDomainName: PropTypes.string,
	};

	static defaultProps = {
		areDomainDetailsLoaded: false,
		isAtomic: false,
	};

	renderNameServerInstructions() {
		const { translate } = this.props;

		const nameServerInstructionsMessage = translate(
			'Please log into your account at your domain registrar and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: <ExternalLink href={ MAP_DOMAIN_CHANGE_NAME_SERVERS } target="_blank" />,
				},
			}
		);

		return (
			<React.Fragment>
				<p>{ nameServerInstructionsMessage }</p>
				<ul>
					{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
						return <li key={ nameServer }>{ nameServer }</li>;
					} ) }
				</ul>
			</React.Fragment>
		);
	}

	renderNameServerMessage() {
		return (
			<FoldableFAQ
				id="advanced-mapping-setup-ns-records"
				key="advanced-mapping-setup-ns-records"
				question={ this.props.translate( 'Advanced setup using NS records' ) }
			>
				{ this.renderNameServerInstructions() }
			</FoldableFAQ>
		);
	}

	renderCnameInstructions() {
		const { domainName, translate, wpcomDomainName } = this.props;

		const cnameInstructionsMessage = translate(
			'Please log into your account at your domain registrar and {{strong}}set the CNAME record{{/strong}} of your subdomain to match the following value, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: <ExternalLink href={ MAP_SUBDOMAIN } target="_blank" />,
				},
			}
		);

		// TODO: Get this value dynamically
		const subdomainPart = 'blog';

		const additionalInstructions = translate(
			'Some DNS managers will only require you to add the subdomain (i.e. "%(subdomainPart)s") in a field typically labeled "host", "name" or "@", and the canonical name part (i.e. "%(canonicalName)s") might be labeled as "points to" or "alias". Also notice the periods (".") after the URLs are important.',
			{
				args: { subdomainPart, canonicalName: wpcomDomainName },
			}
		);

		return (
			<React.Fragment>
				<p>{ cnameInstructionsMessage }</p>
				<ul>
					<li>
						<code>
							{ domainName }. IN CNAME { wpcomDomainName }.
						</code>
					</li>
				</ul>
				<p>{ additionalInstructions }</p>
			</React.Fragment>
		);
	}

	renderCnameMessage() {
		return (
			<FoldableFAQ
				id="advanced-mapping-setup-cname-record"
				key="advanced-mapping-setup-cname-record"
				question={ this.props.translate( 'Advanced setup using CNAME records' ) }
			>
				{ this.renderCnameInstructions() }
			</FoldableFAQ>
		);
	}

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
			<FoldableFAQ
				id="advanced-mapping-setup-a-records"
				key="advanced-mapping-setup-a-records"
				question={ advancedSetupUsingARecordsTitle }
			>
				<Notice status="is-warning" showDismiss={ false } translate={ this.props.translate }>
					{ aRecordMappingWarning }
				</Notice>
				<p>{ aRecordsSetupMessage }</p>
				{ this.renderARecordsList() }
			</FoldableFAQ>
		);
	}

	renderAdvancedSetupMessages() {
		const { aRecordsRequiredForMapping, domainName, isAtomic } = this.props;

		const advancedSetupMessages = [];

		if ( isSubdomain( domainName ) ) {
			if ( ! isAtomic ) {
				advancedSetupMessages.push( this.renderNameServerMessage() );
			} else {
				advancedSetupMessages.push( this.renderCnameMessage() );
			}
		}

		if ( aRecordsRequiredForMapping ) {
			advancedSetupMessages.push( this.renderARecordsMappingMessage() );
		}

		return advancedSetupMessages;
	}

	renderRecommendedSetupMessage() {
		const { domainName, isAtomic, translate } = this.props;

		let recommendedSetupInstructions = null;
		if ( ! isAtomic && isSubdomain( domainName ) ) {
			recommendedSetupInstructions = this.renderCnameInstructions();
		} else {
			recommendedSetupInstructions = this.renderNameServerInstructions();
		}

		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				{ recommendedSetupInstructions }
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
		const { areDomainDetailsLoaded } = this.props;

		if ( ! areDomainDetailsLoaded ) {
			return this.renderPlaceholder();
		}

		return (
			<div className="mapping-instructions">
				{ this.renderRecommendedSetupMessage() }
				{ this.renderAdvancedSetupMessages() }
			</div>
		);
	}
}

export default localize( DomainMappingInstructions );
