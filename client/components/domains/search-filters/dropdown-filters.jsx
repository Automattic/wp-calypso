/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { isEqual, pick } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import ValidationFieldset from 'signup/validation-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import Popover from 'components/popover';
import { Button } from '@automattic/components';

const HANDLED_FILTER_KEYS = [ 'includeDashes', 'maxCharacters', 'exactSldMatchesOnly' ];

export class DropdownFilters extends Component {
	static propTypes = {
		filters: PropTypes.shape( {
			includeDashes: PropTypes.bool,
			maxCharacters: PropTypes.string,
			exactSldMatchesOnly: PropTypes.bool,
		} ).isRequired,
		lastFilters: PropTypes.shape( {
			includeDashes: PropTypes.bool,
			maxCharacters: PropTypes.string,
			exactSldMatchesOnly: PropTypes.bool,
		} ).isRequired,
		popoverId: PropTypes.string,
		onChange: PropTypes.func.isRequired,
		onReset: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
	};

	static defaultProps = {
		popoverId: 'search-filters-dropdown-filters',
	};

	state = {
		showPopover: false,
		showOverallValidationError: false,
	};

	constructor( props ) {
		super( props );
		this.button = React.createRef();
	}

	togglePopover = ( { discardChanges = true } = {} ) => {
		this.setState(
			{
				showPopover: ! this.state.showPopover,
			},
			() => {
				if ( discardChanges && ! this.state.showPopover ) {
					this.props.onChange( this.props.lastFilters );
				}
			}
		);
	};

	getFiltercounts() {
		return (
			( this.props.lastFilters.includeDashes && 1 ) +
			( this.props.lastFilters.exactSldMatchesOnly && 1 ) +
			( this.props.lastFilters.maxCharacters !== '' && 1 )
		);
	}

	getMaxCharactersValidationErrors() {
		const {
			filters: { maxCharacters },
			translate,
		} = this.props;
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

	updateFilterValues = ( name, value ) => {
		this.props.onChange( {
			[ name ]: value,
		} );
	};

	handleOnChange = ( event ) => {
		const { currentTarget } = event;
		if ( currentTarget.type === 'checkbox' ) {
			this.updateFilterValues( currentTarget.name, currentTarget.checked );
		} else if ( currentTarget.type === 'number' ) {
			this.updateFilterValues( currentTarget.name, currentTarget.value );
		}
	};

	handleFiltersReset = () => {
		this.setState( { showOverallValidationError: false }, () => {
			this.togglePopover( { discardChanges: false } );
			this.props.onReset( 'includeDashes', 'maxCharacters', 'exactSldMatchesOnly' );
		} );
	};
	handleFiltersSubmit = () => {
		if ( this.hasValidationErrors() ) {
			this.setState( { showOverallValidationError: true } );
			return;
		}

		this.setState( { showOverallValidationError: false }, () => {
			this.togglePopover( { discardChanges: false } );
			this.hasFiltersChanged() && this.props.onSubmit();
		} );
	};

	hasFiltersChanged() {
		return ! isEqual(
			pick( this.props.filters, HANDLED_FILTER_KEYS ),
			pick( this.props.lastFilters, HANDLED_FILTER_KEYS )
		);
	}

	renderFilterIcon() {
		return (
			<>
				<Gridicon icon="cog" size={ 12 } />
				<span className="search-filters__dropdown-filters-button-text">
					{ this.props.translate( 'Filters' ) }
				</span>
			</>
		);
	}

	render() {
		const hasFilterValues = this.getFiltercounts() > 0;

		return (
			<div
				className={ classNames( 'search-filters__dropdown-filters', {
					'search-filters__dropdown-filters--has-filter-values': hasFilterValues,
					'search-filters__dropdown-filters--is-open': this.state.showPopover,
				} ) }
			>
				<Button
					aria-describedby={ this.props.popoverId }
					aria-expanded={ this.state.showPopover }
					aria-haspopup="true"
					borderless
					ref={ this.button }
					onClick={ this.togglePopover }
				>
					{ this.renderFilterIcon() }
				</Button>

				{ this.state.showPopover && this.renderPopover() }
			</div>
		);
	}

	renderPopover() {
		const {
			filters: { includeDashes, maxCharacters, exactSldMatchesOnly },
			popoverId,
			translate,
		} = this.props;

		const isDashesFilterEnabled = config.isEnabled( 'domains/kracken-ui/dashes-filter' );
		const isExactMatchFilterEnabled = config.isEnabled( 'domains/kracken-ui/exact-match-filter' );
		const isLengthFilterEnabled = config.isEnabled( 'domains/kracken-ui/max-characters-filter' );

		return (
			<Popover
				aria-label="Domain Search Filters"
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button.current }
				id={ popoverId }
				isVisible={ this.state.showPopover }
				onClose={ this.handleFiltersSubmit }
				position="bottom left"
			>
				{ isLengthFilterEnabled && (
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
				) }

				<FormFieldset className="search-filters__checkboxes-fieldset">
					{ isExactMatchFilterEnabled && (
						<FormLabel
							className="search-filters__label"
							htmlFor="search-filters-show-exact-matches-only"
						>
							<FormInputCheckbox
								className="search-filters__checkbox"
								checked={ exactSldMatchesOnly }
								id="search-filters-show-exact-matches-only"
								name="exactSldMatchesOnly"
								onChange={ this.handleOnChange }
								value="exactSldMatchesOnly"
							/>
							<span className="search-filters__checkbox-label">
								{ translate( 'Show exact matches only' ) }
							</span>
						</FormLabel>
					) }

					{ isDashesFilterEnabled && (
						<FormLabel className="search-filters__label" htmlFor="search-filters-include-dashes">
							<FormInputCheckbox
								className="search-filters__checkbox"
								checked={ includeDashes }
								id="search-filters-include-dashes"
								name="includeDashes"
								onChange={ this.handleOnChange }
								value="includeDashes"
							/>
							<span className="search-filters__checkbox-label">
								{ translate( 'Enable dashes' ) }
							</span>
						</FormLabel>
					) }
				</FormFieldset>

				<ValidationFieldset
					className="search-filters__buttons-fieldset"
					errorMessages={ this.getOverallValidationErrors() }
				>
					<div className="search-filters__buttons">
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Reset' ) }</Button>
					</div>
				</ValidationFieldset>
			</Popover>
		);
	}
}

export default localize( DropdownFilters );
