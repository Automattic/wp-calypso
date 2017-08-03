/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormToggle from 'components/forms/form-toggle';
import ShippingCard from './shipping-card';

class LabelSettings extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state with real data
		this.state = {
			visible: true,
			cards: [ {
				selected: true,
				type: 'VISA',
				digits: '1234',
				name: 'Name Surname',
				date: '12/19'
			}, {
				selected: false,
				type: 'MasterCard',
				digits: '5678',
				name: 'Name Surname',
				date: '01/20'
			} ]
		};
	}

	selectCard( index ) {
		const cards = this.state.cards.map( ( card ) => {
			return { ...card, selected: false };
		} );

		cards[ index ].selected = true;

		this.setState( { cards } );
	}

	render() {
		const { translate } = this.props;

		const onToggle = () => {
			this.setState( { visible: ! this.state.visible } );
		};

		const renderCard = ( card, index ) => {
			const onSelect = () => {
				this.selectCard( index );
			};

			return ( <ShippingCard
				key={ index }
				onSelect={ onSelect }
				{ ...card } /> );
		};

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Labels' ) }
					description={ translate( 'Print shipping labels yourself and save a trip to the post office.' ) }>
					<FormToggle onChange={ onToggle } checked={ this.state.visible } />
				</ExtendedHeader>
				<Card className={ classNames( 'shipping__labels-container', { hidden: ! this.state.visible } ) }>
					<FormFieldSet>
						<FormLabel
							className="label-settings__labels-paper-size"
							htmlFor="paper-size">
							{ translate( 'Paper size' ) }
						</FormLabel>
						<FormSelect name="paper-size">
							<option>{ translate( 'Letter' ) }</option>
							<option>{ translate( 'Legal' ) }</option>
							<option>{ translate( 'Label (4"x6")' ) }</option>
							<option>{ translate( 'A4' ) }</option>
						</FormSelect>
					</FormFieldSet>
					<FormFieldSet>
						<FormLabel
							className="label-settings__cards-label">
							{ translate( 'Credit card' ) }
						</FormLabel>
						<p className="label-settings__credit-card-description">
							{ translate( 'Use your credit card on file to pay for the labels you print or add a new one.' ) }
						</p>
						{ this.state.cards.map( renderCard ) }
						<Button compact>{ translate( 'Add another credit card' ) }</Button>
					</FormFieldSet>
				</Card>
			</div>
		);
	}
}

export default localize( LabelSettings );
