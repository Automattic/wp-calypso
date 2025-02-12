import { ExternalLink } from '@automattic/components';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
	MAP_SUBDOMAIN_WITH_CNAME_RECORDS,
} from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { Notice } from 'calypso/components/notice';
import { isSubdomain } from 'calypso/lib/domains';
import { WPCOM_DEFAULT_NAMESERVERS } from 'calypso/my-sites/domains/domain-management/name-servers/constants';

import './style.scss';

class DomainMappingInstructions extends Component {
	static propTypes = {
		aRecordsRequiredForMapping: PropTypes.array,
		areDomainDetailsLoaded: PropTypes.bool,
		domainName: PropTypes.string,
		isAtomic: PropTypes.bool,
		subdomainPart: PropTypes.string,
		wpcomDomainName: PropTypes.string,
	};

	static defaultProps = {
		areDomainDetailsLoaded: false,
		isAtomic: false,
	};

	renderNameServerInstructions() {
		const { translate } = this.props;

		const nameServerInstructionsMessage = translate(
			'Please log into your domain name registrar account and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: <ExternalLink href={ MAP_DOMAIN_CHANGE_NAME_SERVERS } target="_blank" />,
				},
			}
		);

		return (
			<Fragment>
				<p>{ nameServerInstructionsMessage }</p>
				<ul>
					{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
						return <li key={ nameServer }>{ nameServer }</li>;
					} ) }
				</ul>
			</Fragment>
		);
	}

	renderNsRecordsInstructions() {
		const { domainName, translate } = this.props;

		const nameServerInstructionsMessage = translate(
			'Please log into your domain name registrar account and {{strong}}set NS records{{/strong}} for your subdomain to use the following values:',
			{
				components: {
					strong: <strong />,
				},
			}
		);

		return (
			<Fragment>
				<p>{ nameServerInstructionsMessage }</p>
				<ul>
					{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
						return (
							<li key={ nameServer }>
								<code>
									{ domainName }. IN NS { nameServer }.
								</code>
							</li>
						);
					} ) }
				</ul>
			</Fragment>
		);
	}

	renderNsRecordsInstructionsWithHeader() {
		return (
			<FoldableFAQ
				id="alternative-mapping-setup-ns-records"
				key="alternative-mapping-setup-ns-records"
				question={ this.props.translate( 'Alternative setup using NS records' ) }
			>
				{ this.renderNsRecordsInstructions() }
			</FoldableFAQ>
		);
	}

	renderCnameInstructions() {
		const { domainName, isAtomic, subdomainPart, translate, wpcomDomainName } = this.props;

		const cnameMappingWarning = translate(
			'If you map a subdomain using CNAME records rather than NS records, the mapping might stop working if you change your WordPress.com subscription plan in the future.'
		);

		const cnameInstructionsMessage = translate(
			'Please log into your domain name registrar account and set the following value for your {{strong}}CNAME record{{/strong}}, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: <ExternalLink href={ MAP_SUBDOMAIN_WITH_CNAME_RECORDS } target="_blank" />,
				},
			}
		);

		const additionalInstructions = [
			translate(
				'Some DNS managers will only require you to add the subdomain (i.e. "%(subdomainPart)s") in a field typically labeled "host", "name" or "@".',
				{
					args: { subdomainPart },
				}
			),
			translate(
				'Some DNS managers will have the canonical name part (i.e. "%(canonicalName)s") labeled as "points to" or "alias".',
				{
					args: { canonicalName: wpcomDomainName },
				}
			),
			translate( 'Remember to add the periods after the domain names.' ),
			translate(
				"If you're not sure how to do this, we recommend contacting your domain registrar for assistance."
			),
		];

		return (
			<Fragment>
				{ isAtomic && (
					<Notice status="is-warning" showDismiss={ false } translate={ this.props.translate }>
						{ cnameMappingWarning }
					</Notice>
				) }

				<p>{ cnameInstructionsMessage }</p>
				<p>
					<code>
						{ domainName }. IN CNAME { wpcomDomainName }.
					</code>
				</p>
				<ul>
					{ additionalInstructions.map( ( instruction, i ) => (
						<li key={ i }>{ instruction }</li>
					) ) }
				</ul>
			</Fragment>
		);
	}

	renderCnameInstructionsWithHeader() {
		return (
			<FoldableFAQ
				id="alternative-mapping-setup-cname-record"
				key="alternative-mapping-setup-cname-record"
				question={ this.props.translate( 'Alternative setup using CNAME records' ) }
			>
				{ this.renderCnameInstructions() }
			</FoldableFAQ>
		);
	}

	renderARecordsList() {
		const { aRecordsRequiredForMapping, domainName } = this.props;
		return (
			<ul className="mapping-instructions__dns-records-list">
				{ aRecordsRequiredForMapping.map( ( aRecord ) => {
					return (
						<li key={ aRecord }>
							<code>
								{ domainName }. IN A { aRecord }
							</code>
						</li>
					);
				} ) }
			</ul>
		);
	}

	renderARecordsInstructionsWithHeader() {
		const { domainName, translate } = this.props;

		const advancedSetupUsingARecordsTitle = isSubdomain( domainName )
			? translate( 'Alternative setup using A records' )
			: translate( 'Alternative setup using root A records' );
		const aRecordMappingWarning = isSubdomain( domainName )
			? translate(
					'If you map a subdomain using A records rather than WordPress.com name servers, you will need to manage your subdomain’s DNS records yourself for any other services you are using with your subdomain, including email forwarding or email hosting (i.e. with Google Workspace or Titan)'
			  )
			: translate(
					'If you map a domain using A records rather than WordPress.com name servers, you will need to manage your domain’s DNS records yourself for any other services you are using with your domain, including email forwarding or email hosting (i.e. with Google Workspace or Titan)'
			  );
		const aRecordsSetupMessage = this.getARecordsSetupMessage();

		return (
			<FoldableFAQ
				id="alternative-mapping-setup-a-records"
				key="alternative-mapping-setup-a-records"
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

	getARecordsSetupMessage() {
		const { domainName, translate } = this.props;

		if ( isSubdomain( domainName ) ) {
			return translate(
				'Please set the following IP addresses as A records for %(subdomain)s using {{link}}these instructions{{/link}}:',
				{
					args: { subdomain: domainName },
					components: {
						link: <ExternalLink href={ MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS } target="_blank" />,
					},
				}
			);
		}

		return translate(
			'Please set the following IP addresses as root A records using {{link}}these instructions{{/link}}:',
			{
				components: {
					link: <ExternalLink href={ MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS } target="_blank" />,
				},
			}
		);
	}

	renderAdvancedSetupInstructions() {
		const { aRecordsRequiredForMapping, domainName, isAtomic } = this.props;

		const advancedSetupMessages = [];

		if ( isSubdomain( domainName ) ) {
			if ( ! isAtomic ) {
				advancedSetupMessages.push( this.renderNsRecordsInstructionsWithHeader() );
			} else {
				advancedSetupMessages.push( this.renderCnameInstructionsWithHeader() );
			}
		}

		if ( aRecordsRequiredForMapping ) {
			advancedSetupMessages.push( this.renderARecordsInstructionsWithHeader() );
		}

		return advancedSetupMessages;
	}

	renderRecommendedSetupInstructions() {
		const { domainName, isAtomic, translate } = this.props;

		let recommendedSetupInstructions = null;
		if ( isSubdomain( domainName ) ) {
			if ( isAtomic ) {
				recommendedSetupInstructions = this.renderNsRecordsInstructions();
			} else {
				recommendedSetupInstructions = this.renderCnameInstructions();
			}
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
				{ this.renderRecommendedSetupInstructions() }
				{ this.renderAdvancedSetupInstructions() }
			</div>
		);
	}
}

export default localize( DomainMappingInstructions );
