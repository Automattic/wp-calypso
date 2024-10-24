import { Button, Count, FormLabel, Popover } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { includes, isEqual, pick } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import TokenField from 'calypso/components/token-field';
import ValidationFieldset from 'calypso/signup/validation-fieldset';

const HANDLED_FILTER_KEYS = [ 'tlds', 'exactSldMatchesOnly' ];

export class DropdownFilters extends Component {
	static propTypes = {
		availableTlds: PropTypes.array,
		filters: PropTypes.shape( {
			exactSldMatchesOnly: PropTypes.bool,
			tlds: PropTypes.array,
		} ).isRequired,
		lastFilters: PropTypes.shape( {
			exactSldMatchesOnly: PropTypes.bool,
			tlds: PropTypes.array,
		} ).isRequired,
		popoverId: PropTypes.string,
		showTldFilter: PropTypes.bool,
		showTldFilterPlaceholder: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		onReset: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
	};

	static defaultProps = {
		popoverId: 'search-filters-dropdown-filters',
	};

	state = {
		showPopover: false,
	};

	constructor( props ) {
		super( props );
		this.button = createRef();
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
			( this.props.lastFilters.tlds?.length || 0 ) +
			( this.props.lastFilters.exactSldMatchesOnly && 1 )
		);
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
		this.togglePopover( { discardChanges: false } );
		this.props.onReset( 'tlds', 'exactSldMatchesOnly' );
	};

	handleFiltersSubmit = () => {
		this.togglePopover( { discardChanges: false } );
		this.hasFiltersChanged() && this.props.onSubmit();
	};

	hasFiltersChanged() {
		return ! isEqual(
			pick( this.props.filters, HANDLED_FILTER_KEYS ),
			pick( this.props.lastFilters, HANDLED_FILTER_KEYS )
		);
	}

	render() {
		const hasFilterValues = this.getFiltercounts() > 0;

		return (
			<div
				className={ clsx( 'search-filters__dropdown-filters', {
					'search-filters__dropdown-filters--has-filter-values': hasFilterValues,
					'search-filters__dropdown-filters--is-open': this.state.showPopover,
				} ) }
			>
				<Button
					aria-describedby={ this.props.popoverId }
					aria-expanded={ this.state.showPopover }
					aria-haspopup="true"
					ref={ this.button }
					onClick={ this.togglePopover }
				>
					<span className="search-filters__dropdown-filters-button-text">
						{ this.props.translate( 'Filter' ) }
						{ hasFilterValues && <Count primary count={ this.getFiltercounts() } /> }
					</span>
				</Button>

				{ this.state.showPopover && this.renderPopover() }
			</div>
		);
	}

	handleTokenChange = ( newTlds ) => {
		const tlds = newTlds.filter( ( tld ) => includes( this.props.availableTlds, tld ) );
		this.props.onChange( { tlds } );
	};

	/**
	 * Show the first 5 TLDs from the TLD endpoint as recommended and sort the rest alphabetically
	 * @param availableTlds array of TLDs
	 */
	addTldsLabels = ( availableTlds ) => {
		const { translate } = this.props;
		return [
			{ label: translate( 'Recommended endings' ) },
			...availableTlds.slice( 0, 5 ),
			{ label: translate( 'Explore more endings' ) },
			...availableTlds.slice( 5 ).sort(),
		];
	};

	renderPopover() {
		const {
			filters: { exactSldMatchesOnly },
			popoverId,
			translate,
			showTldFilter,
		} = this.props;

		return (
			<Popover
				aria-label="Domain Search Filters"
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button.current }
				id={ popoverId }
				isVisible={ this.state.showPopover }
				onClose={ this.handleFiltersSubmit }
				position={ isWithinBreakpoint( '>660px' ) ? 'bottom' : 'bottom left' }
				{ ...( isWithinBreakpoint( '>660px' ) && { relativePosition: { left: -238 } } ) }
				hideArrow
			>
				{ showTldFilter && (
					<ValidationFieldset className="search-filters__tld-filters">
						<TokenField
							isExpanded
							displayTransform={ ( item ) => `.${ item }` }
							saveTransform={ ( query ) => ( query[ 0 ] === '.' ? query.substr( 1 ) : query ) }
							maxSuggestions={ 500 }
							onChange={ this.handleTokenChange }
							placeholder={ translate( 'Search for an ending' ) }
							suggestions={ this.addTldsLabels( this.props.availableTlds ) }
							tokenizeOnSpace
							value={ this.props.filters.tlds }
						/>
					</ValidationFieldset>
				) }

				<FormFieldset className="search-filters__checkboxes-fieldset">
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
				</FormFieldset>

				<ValidationFieldset className="search-filters__buttons-fieldset">
					<div className="search-filters__buttons">
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Clear' ) }</Button>
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
					</div>
				</ValidationFieldset>
			</Popover>
		);
	}
}

export default localize( DropdownFilters );
