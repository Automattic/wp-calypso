/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import Popover from 'components/popover';
import TokenField from 'components/token-field';

export class TldFilterControl extends Component {
	static propTypes = {
		availableTlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		onChange: PropTypes.func.isRequired,
		onFiltersReset: PropTypes.func.isRequired,
		onFiltersSubmit: PropTypes.func.isRequired,
		tlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
	};

	state = {
		showPopover: false,
	};

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	handleFiltersReset = () => {
		this.togglePopover();
		this.props.onFiltersReset( 'tlds' );
	};
	handleFiltersSubmit = () => {
		this.togglePopover();
		this.props.onFiltersSubmit();
	};
	handleOnChange = newTlds => {
		this.props.onChange(
			'tlds',
			newTlds.filter( tld => includes( this.props.availableTlds, tld ) )
		);
	};

	bindButton = button => ( this.button = button );

	render() {
		const { tlds, translate } = this.props;
		const hasFilterValue = tlds.length > 0;
		return (
			<div className="search-filters__filter search-filters__tld-filter">
				<Button
					className={ classNames( { 'is-active': hasFilterValue } ) }
					onClick={ this.togglePopover }
					ref={ this.bindButton }
				>
					{ translate( 'Extensions', {
						context: 'Refers to top level domain name extension, such as ".com"',
					} ) }
					<Gridicon icon="chevron-down" size={ 24 } />
				</Button>

				{ this.state.showPopover && this.renderPopover() }
			</div>
		);
	}

	renderPopover() {
		const { tlds, translate } = this.props;

		return (
			<Popover
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button }
				isVisible={ this.state.showPopover }
				onClose={ this.togglePopover }
				position="bottom right"
			>
				<FormFieldset className="search-filters__token-field-fieldset">
					<TokenField
						isExpanded
						onChange={ this.handleOnChange }
						placeholder={ translate( 'Select an extension' ) }
						suggestions={ this.props.availableTlds }
						tokenizeOnSpace
						value={ tlds }
					/>
				</FormFieldset>
				<FormFieldset className="search-filters__buttons-fieldset">
					<div className="search-filters__buttons">
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Reset' ) }</Button>
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
					</div>
				</FormFieldset>
			</Popover>
		);
	}
}

export default localize( TldFilterControl );
