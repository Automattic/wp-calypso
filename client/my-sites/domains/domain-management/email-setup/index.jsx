import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { dnsTemplates } from 'calypso/lib/domains/constants';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import EmailProvider from '../dns/email-provider';

import './style.scss';

class EmailSetup extends Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		const { translate } = props;
		const googleServiceName = getGoogleMailServiceFamily();

		this.state = {
			selectedTab: googleServiceName,
			templates: [
				{
					name: googleServiceName,
					label: translate(
						'%(serviceName)s Verification Token - from the TXT record verification',
						{
							args: { serviceName: googleServiceName },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
						}
					),
					placeholder: 'google-site-verification=...',
					validationPattern: /^google-site-verification=[A-Za-z0-9_-]{43}$/,
					dnsTemplateProvider: dnsTemplates.G_SUITE.PROVIDER,
					dnsTemplateService: dnsTemplates.G_SUITE.SERVICE,
				},
				{
					name: 'Office 365',
					label: translate(
						'%(serviceName)s Verification Token - from the TXT record verification',
						{
							args: { serviceName: 'Office 365' },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
						}
					),
					placeholder: 'MS=ms...',
					validationPattern: /^MS=ms\d{8}$/,
					dnsTemplateProvider: dnsTemplates.MICROSOFT_OFFICE365.PROVIDER,
					dnsTemplateService: dnsTemplates.MICROSOFT_OFFICE365.SERVICE,
					modifyVariables: ( variables ) =>
						Object.assign( {}, variables, {
							mxdata: variables.domain.replace( '.', '-' ) + '.mail.protection.outlook.com',
						} ),
				},
				{
					name: 'Zoho Mail',
					label: translate( 'Zoho Mail CNAME zb code' ),
					placeholder: 'zb...',
					validationPattern: /^zb\w{1,100}$/,
					dnsTemplateProvider: dnsTemplates.ZOHO_MAIL.PROVIDER,
					dnsTemplateService: dnsTemplates.ZOHO_MAIL.SERVICE,
				},
			],
		};
	}

	renderProviderTabs = () => {
		return (
			<SectionNav selectedText={ this.state.selectedTab }>
				<NavTabs>{ this.state.templates.map( this.renderProviderTab ) }</NavTabs>
			</SectionNav>
		);
	};

	renderProviderTab = ( template ) => {
		return (
			<NavItem
				key={ `email-provider-${ template.dnsTemplateProvider }` }
				selected={ this.isSelected( template.name ) }
				onClick={ this.selectProvider( template.name ) }
			>
				{ template.name }
			</NavItem>
		);
	};

	isSelected = ( provider ) => {
		return this.state.selectedTab === provider;
	};

	selectProvider = ( provider ) => () => {
		this.setState( { selectedTab: provider } );
	};

	renderConfigurationForm = () => {
		const selectedTemplate = this.state.templates.find(
			( template ) => this.state.selectedTab === template.name
		);
		if ( ! selectedTemplate ) return null;

		return <EmailProvider template={ selectedTemplate } domain={ this.props.selectedDomainName } />;
	};

	render = () => {
		const { translate } = this.props;

		const header = (
			<span>
				<strong>{ translate( 'Email setup' ) }</strong>
				<br />
				<span>{ translate( 'Set up an existing email service for this domain' ) }</span>
			</span>
		);
		return (
			<FoldableCard header={ header } clickableHeader className="email-setup">
				{ this.renderProviderTabs() }
				{ this.renderConfigurationForm() }
			</FoldableCard>
		);
	};
}

export default localize( EmailSetup );
