import { FoldableCard } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
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
						'Paste the verification token provided by %(serviceName)s for the {{strong}}TXT{{/strong}} record:',
						{
							args: { serviceName: googleServiceName },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
							components: {
								strong: <strong />,
							},
						}
					),
					placeholder: 'google-site-verification=...',
					validationPattern: /^google-site-verification=[A-Za-z0-9_-]{43}$/,
					dnsTemplateProvider: dnsTemplates.G_SUITE.PROVIDER,
					dnsTemplateService: dnsTemplates.G_SUITE.SERVICE,
				},
				{
					name: 'iCloud Mail',
					label: translate(
						'Paste the verification token provided by %(serviceName)s for the {{strong}}TXT{{/strong}} record:',
						{
							args: { serviceName: 'iCloud Mail' },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
							components: {
								strong: <strong />,
							},
						}
					),
					placeholder: 'apple-domain=...',
					validationPattern: /^apple-domain=[A-Za-z0-9]{16}$/,
					dnsTemplateProvider: dnsTemplates.ICLOUD_MAIL.PROVIDER,
					dnsTemplateService: dnsTemplates.ICLOUD_MAIL.SERVICE,
				},
				{
					name: 'Office 365',
					label: translate(
						'Paste the verification token provided by %(serviceName)s for the {{strong}}TXT{{/strong}} record:',
						{
							args: { serviceName: 'Office 365' },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
							components: {
								strong: <strong />,
							},
						}
					),
					placeholder: 'MS=ms...',
					validationPattern: /^MS=ms\d{8}$/,
					dnsTemplateProvider: dnsTemplates.MICROSOFT_OFFICE365.PROVIDER,
					dnsTemplateService: dnsTemplates.MICROSOFT_OFFICE365.SERVICE,
					modifyVariables: ( variables ) =>
						Object.assign( {}, variables, {
							mxdata: variables.domain.replaceAll( '.', '-' ) + '.mail.protection.outlook.com',
						} ),
				},
				{
					name: 'Zoho Mail',
					label: translate(
						'Paste the verification code provided by %(serviceName)s for the {{strong}}CNAME{{/strong}} record:',
						{
							args: { serviceName: 'Zoho Mail' },
							comment:
								'%(serviceName)s will be replaced with the name of the service ' +
								'that this token applies to, for example G Suite or Office 365',
							components: {
								strong: <strong />,
							},
						}
					),
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
		if ( ! selectedTemplate ) {
			return null;
		}

		return <EmailProvider template={ selectedTemplate } domain={ this.props.selectedDomainName } />;
	};

	render = () => {
		const { translate } = this.props;

		const header = (
			<span>
				<strong>{ translate( 'Email setup' ) }</strong>
				<br />
				<span className="email-setup__subtitle">
					{ translate( 'Set up an existing email service for this domain' ) }
				</span>
			</span>
		);

		return (
			<FoldableCard
				header={ header }
				clickableHeader
				className="email-setup"
				actionButton={ <Icon icon={ chevronDown } viewBox="6 4 12 14" size={ 16 } /> }
				actionButtonExpanded={ <Icon icon={ chevronUp } viewBox="6 4 12 14" size={ 16 } /> }
			>
				{ this.renderProviderTabs() }
				{ this.renderConfigurationForm() }
			</FoldableCard>
		);
	};
}

export default localize( EmailSetup );
