/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import BulkSelect from 'calypso/components/bulk-select';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';

export default class extends React.Component {
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
			const onClick = function () {
				element.selected = ! element.selected;
				this.forceUpdate();
			}.bind( this );
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
