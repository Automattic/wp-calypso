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
	constructor( props ) {
		super( props );
		this.handleOnClick = this.handleOnClick.bind( this );
	}

	handleOnClick( event ) {
		const { name } = event.currentTarget.dataset;
		this.props.onTemplateClick( name );
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
								data-name={ name }
								onClick={ this.handleOnClick }
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
