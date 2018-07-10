/**
 * External dependencies
 */
import { clone } from 'lodash';

/**
 * WordPress dependencies
 */
import { applyFilters, hasFilter } from '@wordpress/hooks';
import { Component, compose } from '@wordpress/element';
import { Autocomplete as OriginalAutocomplete } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { withBlockEditContext } from '../block-edit/context';

/*
 * Use one array instance for fallback rather than inline array literals
 * because the latter may cause rerender due to failed prop equality checks.
 */
const completersFallback = [];

/**
 * Wrap the default Autocomplete component with one that
 * supports a filter hook for customizing its list of autocompleters.
 *
 * Since there may be many Autocomplete instances at one time, this component
 * applies the filter on demand, when the component is first focused after
 * receiving a new list of completers.
 *
 * This function is exported for unit test.
 *
 * @param  {Function} Autocomplete Original component.
 * @return {Function}              Wrapped component
 */
export function withFilteredAutocompleters( Autocomplete ) {
	return class FilteredAutocomplete extends Component {
		constructor() {
			super();

			this.state = { completers: completersFallback };

			this.saveParentRef = this.saveParentRef.bind( this );
			this.onFocus = this.onFocus.bind( this );
		}

		componentDidUpdate() {
			const hasFocus = this.parentNode.contains( document.activeElement );

			/*
			 * It's possible for props to be updated when the component has focus,
			 * so here, we ensure new completers are immediately applied while we
			 * have the focus.
			 *
			 * NOTE: This may trigger another render but only when the component has focus.
			 */
			if ( hasFocus && this.hasStaleCompleters() ) {
				this.updateCompletersState();
			}
		}

		onFocus() {
			if ( this.hasStaleCompleters() ) {
				this.updateCompletersState();
			}
		}

		hasStaleCompleters() {
			return (
				! ( 'lastFilteredCompletersProp' in this.state ) ||
				this.state.lastFilteredCompletersProp !== this.props.completers
			);
		}

		updateCompletersState() {
			const { blockName, completers } = this.props;
			let nextCompleters = completers;
			const lastFilteredCompletersProp = nextCompleters;

			if ( hasFilter( 'editor.Autocomplete.completers' ) ) {
				nextCompleters = applyFilters(
					'editor.Autocomplete.completers',
					// Provide copies so filters may directly modify them.
					nextCompleters && nextCompleters.map( clone ),
					blockName,
				);
			}

			this.setState( {
				lastFilteredCompletersProp,
				completers: nextCompleters || completersFallback,
			} );
		}

		saveParentRef( parentNode ) {
			this.parentNode = parentNode;
		}

		render() {
			const { completers } = this.state;
			const autocompleteProps = {
				...this.props,
				completers,
			};

			return (
				<div onFocus={ this.onFocus } ref={ this.saveParentRef }>
					<Autocomplete onFocus={ this.onFocus } { ...autocompleteProps } />
				</div>
			);
		}
	};
}

export default compose( [
	withBlockEditContext( ( { name } ) => {
		return {
			blockName: name,
		};
	} ),
	withFilteredAutocompleters,
] )( OriginalAutocomplete );
