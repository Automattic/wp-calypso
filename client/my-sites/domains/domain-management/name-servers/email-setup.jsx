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

import './email-setup.scss';

class EmailSetup extends Component {
	static propTypes = {
		// domains: PropTypes.array.isRequired,
		// dns: PropTypes.object.isRequired,
		// showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
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

	isSelected = ( provider ) => {
		return this.state.selectedTab === provider;
	};

	renderProviders = () => {
		return (
			<SectionNav>
				<NavTabs label="Email providers">
					{ this.state.templates.map( this.renderProvider ) }
				</NavTabs>
			</SectionNav>
		);
	};

	renderProvider = ( template ) => {
		return (
			<NavItem
				selected={ this.isSelected( template.name ) }
				onClick={ () => this.setState( { selectedTab: template.name } ) }
			>
				{ template.name }
			</NavItem>
		);
	};

	renderConfiguration = () => {
		const template = this.state.templates.find( ( t ) => this.state.selectedTab === t.name );
		if ( ! template ) return null;

		return (
			<EmailProvider
				key={ `dns-templates-email-provider-${ template.dnsTemplate }` }
				template={ template }
				domain={ this.props.selectedDomainName }
			/>
		);
	};

	renderMain = () => {
		const header = (
			<span>
				<strong>Email setup</strong>
				<br />
				<span>Set up an existing email service for this domain</span>
			</span>
		);
		return (
			<FoldableCard header={ header } clickableHeader className="email-setup">
				{ this.renderProviders() }
				{ this.renderConfiguration() }
			</FoldableCard>
		);
	};

	render = () => {
		return this.renderMain();
	};
}

export default localize( EmailSetup );
