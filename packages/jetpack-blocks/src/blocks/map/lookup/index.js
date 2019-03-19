/**
 * External dependencies
 */
import classnames from 'classnames';
import { Button, Popover, withFocusOutside, withSpokenMessages } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { debounce, map } from 'lodash';
import { ENTER, ESCAPE, UP, DOWN, LEFT, RIGHT } from '@wordpress/keycodes';
import { sprintf } from '@wordpress/i18n';
import { withInstanceId, compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { __, _n } from '../../../utils/i18n';

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
			isOpen: false,
		};
	}

	constructor() {
		super( ...arguments );
		this.debouncedLoadOptions = debounce( this.loadOptions, 250 );
		this.state = this.constructor.getInitialState();
	}

	componentWillUnmount() {
		this.debouncedLoadOptions.cancel();
	}

	select = option => {
		const { completer } = this.props;
		const getOptionCompletion = completer.getOptionCompletion || {};
		getOptionCompletion( option );
		this.reset();
	};

	reset = () => {
		this.setState( this.constructor.getInitialState() );
	};

	handleFocusOutside() {
		this.reset();
	}

	loadOptions( completer, query ) {
		const { options } = completer;
		const promise = ( this.activePromise = Promise.resolve(
			typeof options === 'function' ? options( query ) : options
		).then( optionsData => {
			if ( promise !== this.activePromise ) {
				// Another promise has become active since this one was asked to resolve, so do nothing,
				// or else we might end triggering a race condition updating the state.
				return;
			}
			const keyedOptions = optionsData.map( ( optionData, optionIndex ) => ( {
				key: `${ optionIndex }`,
				value: optionData,
				label: completer.getOptionLabel( optionData ),
				keywords: completer.getOptionKeywords ? completer.getOptionKeywords( optionData ) : [],
			} ) );

			const filteredOptions = filterOptions( keyedOptions );
			const selectedIndex =
				filteredOptions.length === this.state.filteredOptions.length ? this.state.selectedIndex : 0;
			this.setState( {
				[ 'options' ]: keyedOptions,
				filteredOptions,
				selectedIndex,
				isOpen: filteredOptions.length > 0,
			} );
			this.announce( filteredOptions );
		} ) );
	}

	onChange = query => {
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
	};

	onKeyDown = event => {
		const { isOpen, selectedIndex, filteredOptions } = this.state;
		if ( ! isOpen ) {
			return;
		}
		let nextSelectedIndex;
		switch ( event.keyCode ) {
			case UP:
				nextSelectedIndex = ( selectedIndex === 0 ? filteredOptions.length : selectedIndex ) - 1;
				this.setState( { selectedIndex: nextSelectedIndex } );
				break;

			case DOWN:
				nextSelectedIndex = ( selectedIndex + 1 ) % filteredOptions.length;
				this.setState( { selectedIndex: nextSelectedIndex } );
				break;

			case ENTER:
				this.select( filteredOptions[ selectedIndex ] );
				break;

			case LEFT:
			case RIGHT:
			case ESCAPE:
				this.reset();
				return;

			default:
				return;
		}

		// Any handled keycode should prevent original behavior. This relies on
		// the early return in the default case.
		event.preventDefault();
		event.stopPropagation();
	};
	announce( filteredOptions ) {
		const { debouncedSpeak } = this.props;
		if ( ! debouncedSpeak ) {
			return;
		}
		if ( filteredOptions.length ) {
			debouncedSpeak(
				sprintf(
					_n(
						'%d result found, use up and down arrow keys to navigate.',
						'%d results found, use up and down arrow keys to navigate.',
						filteredOptions.length,
						'jetpack'
					),
					filteredOptions.length
				),
				'assertive'
			);
		} else {
			debouncedSpeak( __( 'No results.' ), 'assertive' );
		}
	}
	render() {
		const { onChange, onKeyDown } = this;
		const { children, instanceId, completer } = this.props;
		const { selectedIndex, filteredOptions } = this.state;
		const { key: selectedKey = '' } = filteredOptions[ selectedIndex ] || {};
		const { className } = completer;
		const isExpanded = filteredOptions.length > 0;
		const listBoxId = isExpanded ? `components-autocomplete-listbox-${ instanceId }` : null;
		const activeId = isExpanded
			? `components-autocomplete-item-${ instanceId }-${ selectedKey }`
			: null;
		return (
			<div className="components-autocomplete">
				{ children( { isExpanded, listBoxId, activeId, onChange, onKeyDown } ) }
				{ isExpanded && (
					<Popover
						focusOnMount={ false }
						onClose={ this.reset }
						position="top center"
						className="components-autocomplete__popover"
						noArrow
					>
						<div id={ listBoxId } role="listbox" className="components-autocomplete__results">
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
	withSpokenMessages,
	withInstanceId,
	withFocusOutside, // this MUST be the innermost HOC as it calls handleFocusOutside
] )( Lookup );
