/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import React, { Component } from 'react';
import { difference, includes, isEqual, pick } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isWithinBreakpoint } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import Popover from 'components/popover';
import TokenField from 'components/token-field';
import { recordTldFilterSelected } from './analytics';
import FormLegend from 'components/forms/form-legend';

const HANDLED_FILTER_KEYS = [ 'tlds' ];

export class TldFilterBar extends Component {
	static propTypes = {
		availableTlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		filters: PropTypes.shape( {
			tlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		} ),
		isSignupStep: PropTypes.bool,
		lastFilters: PropTypes.shape( {
			tlds: PropTypes.arrayOf( PropTypes.string ).isRequired,
		} ),
		numberOfTldsShown: PropTypes.number,
		onChange: PropTypes.func.isRequired,
		onReset: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
		recordTldFilterSelected: PropTypes.func.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		numberOfTldsShown: 6,
	};

	state = {
		showPopover: false,
	};

	bindButton = button => ( this.button = button );

	handleButtonClick = event => {
		const { filters: { tlds = [] } = {} } = this.props;

		const isCurrentlySelected = event.currentTarget.dataset.selected === 'true';
		const newTld = event.currentTarget.value;

		this.props.recordTldFilterSelected(
			newTld,
			event.currentTarget.dataset.index,
			! isCurrentlySelected
		);

		const tldSet = new Set( [ ...tlds, newTld ] );
		if ( isCurrentlySelected ) {
			tldSet.delete( newTld );
		}

		const newTlds = [ ...tldSet ];
		this.props.onChange( { tlds: newTlds }, { shouldSubmit: true } );
	};
	handleFiltersReset = () => {
		this.togglePopover();
		this.props.onReset( 'tlds' );
	};
	handleFiltersSubmit = () => {
		this.togglePopover();
		this.hasFiltersChanged() && this.props.onSubmit();
	};
	handleTokenChange = newTlds => {
		const tlds = newTlds.filter( tld => includes( this.props.availableTlds, tld ) );
		this.props.onChange( { tlds } );
	};

	togglePopover = () => {
		this.setState( {
			showPopover: ! this.state.showPopover,
		} );
	};

	hasFiltersChanged() {
		return ! isEqual(
			pick( this.props.filters, HANDLED_FILTER_KEYS ),
			pick( this.props.lastFilters, HANDLED_FILTER_KEYS )
		);
	}

	render() {
		const { showDesignUpdate, isSignupStep, showPlaceholder, translate } = this.props;

		if ( showPlaceholder ) {
			return this.renderPlaceholder();
		}

		const className = classNames( {
			'search-filters__buttons': ! showDesignUpdate,
			'search-filters__checkboxes': showDesignUpdate,
			'search-filters__tld-filter-bar--is-domain-management': ! isSignupStep,
		} );

		if ( showDesignUpdate ) {
			return (
				<CompactCard className={ className }>
					<FormLegend className="search-filters__filter-by">
						{ translate( 'Filter by:' ) }
					</FormLegend>
					{ this.renderSuggestedCheckboxes() }
					{ this.renderPopoverButton() }
					{ this.state.showPopover && this.renderPopover() }
				</CompactCard>
			);
		}

		return (
			<CompactCard className={ className }>
				{ this.renderPopoverButton() }
				{ this.renderSuggestedButtons() }
				{ this.state.showPopover && this.renderPopover() }
			</CompactCard>
		);
	}

	renderSuggestedCheckboxes() {
		const {
			lastFilters: { tlds: selectedTlds },
		} = this.props;
		const checkboxes = this.props.availableTlds
			.slice( 0, this.props.numberOfTldsShown )
			.map( ( tld, index ) => (
				<div className="search-filters__tld-checkbox">
					<FormCheckbox
						className={ classNames( 'search-filters__tld-button', {
							'is-active': includes( selectedTlds, tld ),
						} ) }
						checked={ includes( selectedTlds, tld ) }
						data-selected={ includes( selectedTlds, tld ) }
						data-index={ index }
						onChange={ this.handleButtonClick }
						value={ tld }
					/>
					<span>.{ tld }</span>
				</div>
			) );

		return <div className="search-filters__tld-checkbox-filter-bar">{ checkboxes }</div>;
	}

	renderSuggestedButtons() {
		const {
			lastFilters: { tlds: selectedTlds },
		} = this.props;
		return this.props.availableTlds
			.slice( 0, this.props.numberOfTldsShown )
			.map( ( tld, index ) => (
				<Button
					className={ classNames( 'search-filters__tld-button', {
						'is-active': includes( selectedTlds, tld ),
					} ) }
					data-selected={ includes( selectedTlds, tld ) }
					data-index={ index }
					key={ tld }
					onClick={ this.handleButtonClick }
					value={ tld }
				>
					.{ tld }
				</Button>
			) );
	}

	getNumberOfTldsShownInViewport() {
		// The number of TLDs shown for each breakpoint should match the CSS rule.
		// e.g. .search-filters__tld-checkbox:nth-child( n + 5 ) is defined as display: none for screen size <800px,
		// so we return 4 for isWithinBreakpoint( '<800px' ).
		if ( isWithinBreakpoint( '<480px' ) ) {
			return 1;
		}

		if ( isWithinBreakpoint( '<660px' ) ) {
			return 2;
		}

		if ( isWithinBreakpoint( '<800px' ) ) {
			return 4;
		}

		if ( isWithinBreakpoint( '>800px' ) ) {
			return this.props.numberOfTldsShown;
		}
	}

	renderPopoverButton() {
		const {
			filters: { tlds = [] } = {},
			lastFilters: { tlds: lastFilterTlds = [] } = {},
			availableTlds,
			translate,
		} = this.props;

		let isActive;
		if ( this.props.showDesignUpdate ) {
			const numberOfTldsShownInViewport = this.getNumberOfTldsShownInViewport();
			const visibleTldsInFilterBar = availableTlds.slice( 0, numberOfTldsShownInViewport );
			const isSelectedFiltersNotInFilterBar =
				difference( lastFilterTlds, visibleTldsInFilterBar ).length > 0;
			isActive = isSelectedFiltersNotInFilterBar;
		} else {
			isActive = tlds.length > 0;
		}

		return (
			<Button
				className={ classNames( 'search-filters__popover-button', {
					'is-active': isActive,
					'search-filters__popover-button-domain-step-test': this.props.showDesignUpdate,
				} ) }
				onClick={ this.togglePopover }
				ref={ this.bindButton }
				key="popover-button"
			>
				{ translate( 'More Extensions', {
					context: 'TLD filter button',
					comment: 'Refers to top level domain name extension, such as ".com"',
				} ) }
				<Gridicon icon="chevron-down" size={ 24 } />
			</Button>
		);
	}

	renderPopover() {
		const { translate } = this.props;

		return (
			<Popover
				autoPosition={ false }
				className="search-filters__popover"
				context={ this.button }
				isVisible={ this.state.showPopover }
				onClose={ this.handleFiltersSubmit }
				position="bottom left"
			>
				<FormFieldset className="search-filters__token-field-fieldset">
					<TokenField
						isExpanded
						displayTransform={ item => `.${ item }` }
						saveTransform={ query => ( query[ 0 ] === '.' ? query.substr( 1 ) : query ) }
						maxSuggestions={ 500 }
						onChange={ this.handleTokenChange }
						placeholder={ translate( 'Select an extension' ) }
						suggestions={ [ ...this.props.availableTlds ].sort() }
						tokenizeOnSpace
						value={ this.props.filters.tlds }
					/>
				</FormFieldset>
				<FormFieldset className="search-filters__buttons-fieldset">
					<div className="search-filters__buttons">
						<Button primary onClick={ this.handleFiltersSubmit }>
							{ translate( 'Apply' ) }
						</Button>
						<Button onClick={ this.handleFiltersReset }>{ translate( 'Reset' ) }</Button>
					</div>
				</FormFieldset>
			</Popover>
		);
	}

	renderPlaceholder() {
		return (
			<CompactCard className="search-filters__buttons">
				{ [ ...Array( this.props.numberOfTldsShown ) ].map( ( undef, index ) => (
					<Button className="search-filters__button--is-placeholder" key={ index } disabled />
				) ) }
			</CompactCard>
		);
	}
}
export default connect( null, {
	recordTldFilterSelected,
} )( localize( TldFilterBar ) );
