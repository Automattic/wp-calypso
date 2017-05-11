/**
 * External dependencies
 */
import React, { Component } from 'react';
import { find, replace } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { dnsTemplates } from 'lib/domains/constants';
import DnsTemplateButtonGroup from './dns-template-button-group';
import EmailProvider from '../dns/email-provider';

class DnsTemplates extends Component {
	constructor( props ) {
		super( props );
		const { translate } = this.props;
		this.state = {
			currentComponentName: null,
			currentProviderCardName: null,
			templates: [
				{
					name: 'G Suite',
					label: translate( 'G Suite Verification Token - from the TXT record verification' ),
					placeholder: 'google-site-verification=...',
					validationPattern: /^google-site-verification=\w{43}$/,
					dnsTemplate: dnsTemplates.G_SUITE
				},
				{
					name: 'Office 365',
					label: translate( 'Office 365 Verification Token - from the TXT record verification' ),
					placeholder: 'MS=ms...',
					validationPattern: /^MS=ms\d{8}$/,
					dnsTemplate: dnsTemplates.MICROSOFT_OFFICE365,
					modifyVariables: ( variables ) => Object.assign(
						{},
						variables,
						{ mxdata: replace( variables.domain, '.', '-' ) + '.mail.protection.outlook.com.' }
					)
				},
				{
					name: 'Zoho Mail',
					label: translate( 'Zoho Mail CNAME zb code' ),
					placeholder: 'zb...',
					validationPattern: /^zb\w{1,100}$/,
					dnsTemplate: dnsTemplates.ZOHO_MAIL
				}
			]
		};
	}

	onTemplateClick = ( name ) => {
		this.setState(
			{ currentComponentName: name }
		);
	};

	showCurrentTemplate() {
		if ( ! this.state.currentComponentName ) {
			return;
		}

		const componentName = this.state.currentComponentName,
			template = find( this.state.templates, ( dnsTemplate ) => dnsTemplate.name === componentName );

		return <EmailProvider
			key={ `dns-templates-email-provider-${ template.dnsTemplate }` }
			template={ template }
			domain={ this.props.selectedDomainName }
		/>;
	}

	render() {
		const { translate } = this.props;

		return (
			<div>
				<Card compact className="name-servers__dns-templates">
					<span className="name-servers__title">
						{ translate( 'If you have already bought an e-mail service for the domain, ' +
							'you can set it up with us easily:' ) }
					</span>
					<div className="name-servers__dns-templates-buttons">
						<DnsTemplateButtonGroup
							templates={ this.state.templates }
							onTemplateClick={ this.onTemplateClick }
						/>
					</div>
					<div className="name-servers__dns-templates-forms">
						{ this.showCurrentTemplate() }
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( DnsTemplates );
