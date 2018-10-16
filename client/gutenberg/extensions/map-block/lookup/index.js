// @TODO: key commands, spoken messages, consider suggesting as a core Gutenberg component

/**
 * External dependencies
 */

import classnames from 'classnames';
import {
	map,
	debounce
} from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import {
	withInstanceId,
	compose
} from '@wordpress/compose';

import {
	Button,
	Popover,
	withFocusOutside
} from '@wordpress/components';

function filterOptions( options = [], maxResults = 10 ) {
	const filtered = [];
	for ( let i = 0; i < options.length; i++ ) {
		const option = options[ i ];

		// Merge label into keywords
		let { keywords = [] } = option;
		if ( 'string' === typeof option.label ) {
			keywords = [ ...keywords, option.label ];
		}

		filtered.push( option );

		// Abort early if max reached
		if ( filtered.length === maxResults ) {
			break;
		}
	}

	return filtered;
}

export class Lookup extends Component {

	static getInitialState() {

		return {
			selectedIndex: 0,
			query: undefined,
			filteredOptions: [],
		};

	}

	constructor() {

		super( ...arguments );

		this.select = this.select.bind( this );
		this.reset = this.reset.bind( this );
		this.debouncedLoadOptions = debounce( this.loadOptions, 250 );

		this.state = this.constructor.getInitialState();
		this.onChange = this.onChange.bind( this );

	}

	componentWillUnmount() {

		this.debouncedLoadOptions.cancel();

	}

	select( option ) {

		const { completer } = this.props;
		const getOptionCompletion = completer.getOptionCompletion || {};
		getOptionCompletion( option );
		this.reset();

	}

	reset() {

		this.setState( this.constructor.getInitialState() );

	}

	handleFocusOutside() {

		this.reset();

	}

	loadOptions( completer, query ) {

		const { options } = completer;
		const promise = this.activePromise = Promise.resolve(
			typeof options === 'function' ? options( query ) : options
		).then( ( optionsData ) => {
			if ( promise !== this.activePromise ) {
				// Another promise has become active since this one was asked to resolve, so do nothing,
				// or else we might end triggering a race condition updating the state.
				return;
			}
			const keyedOptions = optionsData.map( ( optionData, optionIndex ) => ( {
				key: `${ optionIndex }`,
				value: optionData,
				label: completer.getOptionLabel( optionData ),
				keywords: completer.getOptionKeywords ? completer.getOptionKeywords( optionData ) : []
			} ) );

			const filteredOptions = filterOptions( keyedOptions );
			const selectedIndex = filteredOptions.length === this.state.filteredOptions.length ? this.state.selectedIndex : 0;
			this.setState( {
				[ 'options' ]: keyedOptions,
				filteredOptions,
				selectedIndex,
			} );
		} );

	}

	onChange( query ) {

		const { completer } = this.props;
		const { options } = this.state;

		if ( ! query ) {
			this.reset();
			return;
		}

		if ( completer ) {
			if ( completer.isDebounced ) {
				this.debouncedLoadOptions( completer, query );
			} else {
				this.loadOptions( completer, query );
			}
		}

		const filteredOptions = completer ? filterOptions( options ) : [];
		if ( completer ) {
			this.setState( { selectedIndex: 0, filteredOptions, query } );
		}

	}

	render() {

		const { onChange } = this;
		const { children, instanceId, completer } = this.props;
		const { selectedIndex, filteredOptions } = this.state;
		const { key: selectedKey = '' } = filteredOptions[ selectedIndex ] || {};
		const { className } = completer;
		const isExpanded = filteredOptions.length > 0;
		const listBoxId = isExpanded ? `components-autocomplete-listbox-${ instanceId }` : null;
		const activeId = isExpanded ? `components-autocomplete-item-${ instanceId }-${ selectedKey }` : null;
		return (
			<div
				className="components-autocomplete"
			>
				{ children( { isExpanded, listBoxId, activeId, onChange } ) }
				{ isExpanded && (
					<Popover
						focusOnMount={ false }
						onClose={ this.reset }
						position="top center"
						className="components-autocomplete__popover"
						noArrow
					>
						<div
							id={ listBoxId }
							role="listbox"
							className="components-autocomplete__results"
						>
							{ map( filteredOptions, ( option, index ) => (
								<Button
									key={ option.key }
									id={ `components-autocomplete-item-${ instanceId }-${ option.key }` }
									role="option"
									aria-selected={ index === selectedIndex }
									disabled={ option.isDisabled }
									className={ classnames( 'components-autocomplete__result', className, {
										'is-selected': index === selectedIndex,
									} ) }
									onClick={ () => this.select( option ) }
								>
									{ option.label }
								</Button>
							) ) }
						</div>
					</Popover>
				) }
			</div>
		);
	}
}

export default compose( [
	withInstanceId,
	withFocusOutside, // this MUST be the innermost HOC as it calls handleFocusOutside
] )( Lookup );
