import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import isSuggestionLabel from './helpers';

class SuggestionsList extends PureComponent {
	static propTypes = {
		isExpanded: PropTypes.bool,
		match: PropTypes.string,
		displayTransform: PropTypes.func.isRequired,
		onSelect: PropTypes.func,
		suggestions: PropTypes.array,
		selectedIndex: PropTypes.number,
	};

	static defaultProps = {
		isExpanded: false,
		match: '',
		onHover: function () {},
		onSelect: function () {},
		suggestions: Object.freeze( [] ),
	};

	listRef = createRef();

	componentDidUpdate( prevProps ) {
		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if (
			prevProps.isExpanded &&
			this.props.isExpanded &&
			this.props.selectedIndex > -1 &&
			this.props.scrollIntoView
		) {
			this._scrollingIntoView = true;
			const node = this.listRef.current;

			const child = node && node.children[ this.props.selectedIndex ];
			if ( child ) {
				scrollIntoViewport( child, {
					block: 'nearest',
					scrollMode: 'if-needed',
				} );
			}

			setTimeout( () => {
				this._scrollingIntoView = false;
			}, 100 );
		}
	}

	_computeSuggestionMatch = ( suggestion ) => {
		const match = this.props.displayTransform( this.props.match || '' ).toLocaleLowerCase();

		if ( match.length === 0 ) {
			return null;
		}

		suggestion = this.props.displayTransform( suggestion );
		const indexOfMatch = suggestion.toLocaleLowerCase().indexOf( match );

		return {
			suggestionBeforeMatch: suggestion.substring( 0, indexOfMatch ),
			suggestionMatch: suggestion.substring( indexOfMatch, indexOfMatch + match.length ),
			suggestionAfterMatch: suggestion.substring( indexOfMatch + match.length ),
		};
	};

	render() {
		const classes = clsx( 'token-field__suggestions-list', {
			'is-expanded': this.props.isExpanded && this.props.suggestions.length > 0,
		} );

		// We set `tabIndex` here because otherwise Firefox sets focus on this
		// div when tabbing off of the input in `TokenField` -- not really sure
		// why, since usually a div isn't focusable by default
		// TODO does this still apply now that it's a <ul> and not a <div>?
		return (
			<ul ref={ this.listRef } className={ classes } tabIndex="-1">
				{ this._renderSuggestions() }
			</ul>
		);
	}

	_removeEmptyLabelsFromSuggestions( suggestions ) {
		const filteredSuggestions = [];
		for ( let i = 0; i < suggestions.length; i++ ) {
			const [ currentSuggestion, nextSuggestion ] = [ suggestions[ i ], suggestions?.[ i + 1 ] ];

			if (
				isSuggestionLabel( currentSuggestion ) &&
				( ! nextSuggestion || isSuggestionLabel( nextSuggestion ) )
			) {
				continue;
			}
			filteredSuggestions.push( suggestions[ i ] );
		}
		return filteredSuggestions;
	}

	_renderSuggestions = () => {
		const filteredSuggestions = this._removeEmptyLabelsFromSuggestions( this.props.suggestions );

		return filteredSuggestions.map( ( suggestion, index ) => {
			const isLabel = isSuggestionLabel( suggestion );

			const classes = clsx( 'token-field__suggestion', {
				'is-selected': index === this.props.selectedIndex,
				'is-label': isLabel,
			} );

			if ( isLabel ) {
				return (
					<li className={ classes } key={ `label_${ suggestion.label }` }>
						{ suggestion.label }
					</li>
				);
			}

			const match = this._computeSuggestionMatch( suggestion );

			return (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
				<li
					className={ classes }
					key={ suggestion }
					onMouseDown={ this._handleMouseDown }
					onClick={ this._handleClick( suggestion ) }
					onMouseEnter={ this._handleHover( suggestion ) }
				>
					{ match ? (
						<span>
							{ match.suggestionBeforeMatch }
							<strong className="token-field__suggestion-match">{ match.suggestionMatch }</strong>
							{ match.suggestionAfterMatch }
						</span>
					) : (
						this.props.displayTransform( suggestion )
					) }
				</li>
			);
		} );
	};

	_handleHover( suggestion ) {
		return () => {
			if ( ! this._scrollingIntoView ) {
				this.props.onHover( suggestion );
			}
		};
	}

	_handleClick( suggestion ) {
		return () => {
			this.props.onSelect( suggestion );
		};
	}

	_handleMouseDown = ( e ) => {
		// By preventing default here, we will not lose focus of <input> when clicking a suggestion
		e.preventDefault();
	};
}

export default SuggestionsList;
