/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import Popover from 'components/popover';
import Button from 'components/button';

export class MoreFiltersControl extends Component {
	static propTypes = {
		excludeDashes: PropTypes.bool,
		maxCharacters: PropTypes.number,
		onChange: PropTypes.func,
		onFiltersReset: PropTypes.func,
		onFiltersSubmit: PropTypes.func,
		showExactMatchesOnly: PropTypes.bool,
	};

	static defaultProps = {
		excludeDashes: true,
		showExactMatchesOnly: false,
	};

	state = {
		showPopover: false,
	};

	bindButton = button => ( this.button = button );

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	hasFilterValues() {
		return (
			! this.props.excludeDashes ||
			this.props.showExactMatchesOnly ||
			Number.isFinite( this.props.maxCharacters )
		);
	}

	getFiltercounts() {
		return (
			( ! this.props.excludeDashes && 1 ) +
			( this.props.showExactMatchesOnly && 1 ) +
			Number.isFinite( this.props.maxCharacters && 1 )
		);
	}

	handleOnChange = event => {
		const { currentTarget } = event;
		if ( currentTarget.type === 'checkbox' ) {
			this.props.onChange( currentTarget.name, currentTarget.checked );
		} else if ( currentTarget.type === 'text' ) {
			this.props.onChange( currentTarget.name, currentTarget.value );
		}
	};

	handleFiltersReset = () => {
		this.togglePopover();
		this.props.onFiltersReset();
	};
	handleFiltersSubmit = () => {
		this.togglePopover();
		this.props.onFiltersSubmit();
	};

	render() {
		const { translate } = this.props;
		return (
			<div className="search-filters__more-filters">
				<Button
					primary={ this.hasFilterValues() }
					ref={ this.bindButton }
					onClick={ this.togglePopover }
				>
					{ translate( 'More Filters' ) }
					{ this.hasFilterValues() ? ` • ${ this.getFiltercounts() } ` : ' ' }
					<Gridicon icon="chevron-down" size={ 24 } />
				</Button>

				{ this.renderPopover() }
			</div>
		);
	}

	renderPopover() {
		const { excludeDashes, maxCharacters, showExactMatchesOnly, translate } = this.props;

		return (
			<Popover
				className="search-filters__popover"
				context={ this.button }
				isVisible={ this.state.showPopover }
				position="bottom right"
			>
				<FormFieldset className="search-filters__text-input-fieldset">
					<FormLabel className="search-filters__label" htmlFor="search-filters-max-characters">
						{ translate( 'Max Characters' ) }:
					</FormLabel>
					<FormTextInput
						className="search-filters__input"
						value={ maxCharacters }
						id="search-filters-max-characters"
						name="maxCharacters"
						onChange={ this.handleOnChange }
						placeholder="14"
					/>
				</FormFieldset>

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

					<FormLabel className="search-filters__label" htmlFor="search-filters-exclude-dashes">
						<FormInputCheckbox
							className="search-filters__checkbox"
							checked={ excludeDashes }
							id="search-filters-exclude-dashes"
							name="excludeDashes"
							onChange={ this.handleOnChange }
							value="excludeDashes"
						/>
						<span className="search-filters__checkbox-label">
							{ translate( 'Exclude dashes' ) }
						</span>
					</FormLabel>
				</FormFieldset>
				<div className="search-filters__buttons">
					<Button onClick={ this.handleFiltersReset }>Reset</Button>
					<Button primary onClick={ this.handleFiltersSubmit }>
						Apply
					</Button>
				</div>
			</Popover>
		);
	}
}

export default localize( MoreFiltersControl );
