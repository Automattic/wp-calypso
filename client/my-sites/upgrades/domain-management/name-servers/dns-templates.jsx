/**
 * External dependencies
 */
import React, { Component } from 'react';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DnsTemplateButton from './dns-template-button';
import Office365 from '../dns/office-365';

class DnsTemplates extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			currentComponentName: null,
			templates: [
				{ name: 'Office 365', Component: Office365 }
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
			template = find( this.state.templates, ( dnsTemplate ) => dnsTemplate.name === componentName ),
			DnsTemplate = template.Component;

		return <DnsTemplate
			key={ `dns-templates-${ componentName }` }
			domain={ this.props.selectedDomainName }
		/>;
	}

	render() {
		const { translate } = this.props;

		return (
			<Card compact className="name-servers__dns-templates">
				<span className="name-servers__title">
					{ translate( 'If you have already bought an e-mail service for the domain, ' +
						'you can set it up with us easily:' ) }
				</span>
				<div className="name-servers__dns-templates-buttons">
					{
						this.state.templates.map( ( template ) => {
							const { name } = template;
							return (
								<DnsTemplateButton
									key={ `dns-templates-button-${ name }` }
									name={ name }
									onTemplateClick={ this.onTemplateClick }
								/>
							);
						}, this )
					}
				</div>
				<div className="name-servers__dns-templates-forms">
					{ this.showCurrentTemplate() }
				</div>
			</Card>
		);
	}
}

export default localize( DnsTemplates );
