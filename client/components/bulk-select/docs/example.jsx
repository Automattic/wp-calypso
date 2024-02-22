import { Card, FormLabel } from '@automattic/components';
import { Component } from 'react';
import BulkSelect from 'calypso/components/bulk-select';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';

export default class extends Component {
	static displayName = 'BulkSelects';

	state = {
		elements: [
			{ title: 'Apples', selected: true },
			{ title: 'Oranges', selected: false },
		],
	};

	handleToggleAll = ( checkedState ) => {
		const newElements = [];
		this.state.elements.forEach( ( element ) => {
			if ( typeof checkedState !== 'undefined' ) {
				element.selected = checkedState;
			} else {
				element.selected = ! element.selected;
			}
			newElements.push( element );
		} );
		this.setState( { elements: newElements } );
	};

	getSelectedElementsNumber = () => {
		return this.state.elements.filter( function ( element ) {
			return element.selected;
		} ).length;
	};

	renderElements = () => {
		return this.state.elements.map( ( element, index ) => {
			const onClick = () => {
				element.selected = ! element.selected;
				this.forceUpdate();
			};
			return (
				<FormLabel key={ index }>
					<FormInputCheckbox onClick={ onClick } checked={ element.selected } readOnly />
					<span>{ element.title }</span>
				</FormLabel>
			);
		} );
	};

	render() {
		return (
			<Card>
				<div>
					<BulkSelect
						totalElements={ this.state.elements.length }
						selectedElements={ this.getSelectedElementsNumber() }
						onToggle={ this.handleToggleAll }
					/>
				</div>
				{ this.renderElements() }
			</Card>
		);
	}
}
