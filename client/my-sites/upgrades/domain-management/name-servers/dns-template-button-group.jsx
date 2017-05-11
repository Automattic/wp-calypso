/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';

class DnsTemplateButtonGroup extends Component {
	onClick( name ) {
		return () => this.props.onTemplateClick( name );
	}

	render() {
		const { templates } = this.props;

		return (
			<ButtonGroup>
				{
					templates.map( ( template ) => {
						const { name } = template;
						return (
							<Button
								key={ `dns-templates-button-${ name }` }
								onClick={ this.onClick( name ) }
							>
								{ name }
							</Button>
						);
					}, this )
				}
			</ButtonGroup>
		);
	}
}

export default DnsTemplateButtonGroup;
