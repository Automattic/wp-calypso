/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ValidationFieldset from 'signup/validation-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import Popover from 'components/popover';
import Button from 'components/button';

export class MoreFiltersControl extends Component {
	static propTypes = {
		includeDashes: PropTypes.bool.isRequired,
		maxCharacters: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		onFiltersReset: PropTypes.func.isRequired,
		onFiltersSubmit: PropTypes.func.isRequired,
		showExactMatchesOnly: PropTypes.bool.isRequired,
	};

	state = {
		showPopover: false,
		showOverallValidationError: false,
	};

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	getFiltercounts() {
		return (
			( this.props.includeDashes && 1 ) +
			( this.props.showExactMatchesOnly && 1 ) +
			( this.props.maxCharacters !== '' && 1 )
		);
	}

	getMaxCharactersValidationErrors() {
		const { maxCharacters, translate } = this.props;
		const isValid = /^-?\d*$/.test( maxCharacters );
		return ! isValid ? [ translate( 'Value must be a whole number' ) ] : null;
	}

	getOverallValidationErrors() {
		const isValid = this.getMaxCharactersValidationErrors() === null;
		const { showOverallValidationError } = this.state;
		return ! isValid && showOverallValidationError
			? [ this.props.translate( 'Please correct any errors above' ) ]
			: null;
	}

	hasValidationErrors() {
		return this.getOverallValidationErrors() !== null;
	}

	handleOnChange = event => {
		const { currentTarget } = event;
		if ( currentTarget.type === 'checkbox' ) {
			this.props.onChange( currentTarget.name, currentTarget.checked );
		} else if ( currentTarget.type === 'number' ) {
			window.currentTarget = currentTarget;
			this.props.onChange( currentTarget.name, currentTarget.value );
		}
	};

	handleFiltersReset = () => {
		this.setState( { showOverallValidationError: false }, () => {
			this.togglePopover();
			this.props.onFiltersReset( 'includeDashes', 'maxCharacters', 'showExactMatchesOnly' );
		} );
	};
	handleFiltersSubmit = () => {
		if ( this.hasValidationErrors() ) {
			this.setState( { showOverallValidationError: true } );
			return;
		}

		this.setState( { showOverallValidationError: false }, () => {
			this.togglePopover();
			this.props.onFiltersSubmit();
		} );
	};

	render() {
		const { translate } = this.props;
		const hasFilterValues = this.getFiltercounts() > 0;
		return (
			<div className="search-filters__filter search-filters__more-filters">
				<Button
					className={ classNames( { 'is-active': hasFilterValues } ) }
					ref={ button => ( this.button = button ) } // eslint-disable-line react/jsx-no-bind
					onClick={ this.togglePopover }
				>
					{ translate( 'More Filters' ) }
					{ hasFilterValues ? ` • ${ this.getFiltercounts() } ` : ' ' }
					<Gridicon icon="chevron-down" size={ 24 } />
				</Button>

				{ this.state.showPopover && this.renderPopover() }
			</div>
		);
	}

	renderPopover() {
		const { includeDashes, maxCharacters, showExactMatchesOnly, translate } = this.props;

		return (
			<Popover
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button }
				isVisible={ this.state.showPopover }
				onClose={ this.togglePopover }
				position="bottom right"
			>
				<ValidationFieldset
					className="search-filters__text-input-fieldset"
					errorMessages={ this.getMaxCharactersValidationErrors() }
				>
					<FormLabel className="search-filters__label" htmlFor="search-filters-max-characters">
						{ translate( 'Max Characters' ) }:
					</FormLabel>
					<FormTextInput
						className="search-filters__input"
						id="search-filters-max-characters"
						min="1"
						name="maxCharacters"
						onChange={ this.handleOnChange }
						placeholder="14"
						type="number"
						value={ maxCharacters }
					/>
				</ValidationFieldset>

				<FormFieldset className="search-filters__checkboxes-fieldset">
					<FormLabel
						className="search-filters__label"
						htmlFor="search-filters-show-exact-matches-only"
					>
						<FormInputCheckbox
							className="search-filters__checkbox"
							checked={ showExactMatchesOnly }
							id="search-filters-show-exact-matches-only"
							name="showExactMatchesOnly"
							onChange={ this.handleOnChange }
							value="showExactMatchesOnly"
						/>
						<span className="search-filters__checkbox-label">
							{ translate( 'Show exact matches only' ) }
						</span>
					</FormLabel>

					<FormLabel className="search-filters__label" htmlFor="search-filters-include-dashes">
						<FormInputCheckbox
							className="search-filters__checkbox"
							checked={ includeDashes }
							id="search-filters-include-dashes"
							name="includeDashes"
							onChange={ this.handleOnChange }
							value="includeDashes"
						/>
						<span className="search-filters__checkbox-label">{ translate( 'Enable dashes' ) }</span>
					</FormLabel>
				</FormFieldset>

				<ValidationFieldset
					className="search-filters__buttons-fieldset"
					errorMessages={ this.getOverallValidationErrors() }
				>
					<div className="search-filters__buttons">
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Reset' ) }</Button>
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
					</div>
				</ValidationFieldset>
			</Popover>
		);
	}
}

export default localize( MoreFiltersControl );
