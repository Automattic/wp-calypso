/**
 * External dependencies
 */
import { map } from 'lodash';
import scrollIntoView from 'dom-scroll-into-view';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class SuggestionsList extends Component {
	constructor() {
		super( ...arguments );
		this.handleMouseDown = this.handleMouseDown.bind( this );
		this.bindList = this.bindList.bind( this );
	}

	componentDidUpdate() {
		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if ( this.props.selectedIndex > -1 && this.props.scrollIntoView ) {
			this.scrollingIntoView = true;
			scrollIntoView( this.list.children[ this.props.selectedIndex ], this.list, {
				onlyScrollIfNeeded: true,
			} );

			setTimeout( () => {
				this.scrollingIntoView = false;
			}, 100 );
		}
	}

	bindList( ref ) {
		this.list = ref;
	}

	handleHover( suggestion ) {
		return () => {
			if ( ! this.scrollingIntoView ) {
				this.props.onHover( suggestion );
			}
		};
	}

	handleClick( suggestion ) {
		return () => {
			this.props.onSelect( suggestion );
		};
	}

	handleMouseDown( e ) {
		// By preventing default here, we will not lose focus of <input> when clicking a suggestion
		e.preventDefault();
	}

	computeSuggestionMatch( suggestion ) {
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
	}

	render() {
		// We set `tabIndex` here because otherwise Firefox sets focus on this
		// div when tabbing off of the input in `TokenField` -- not really sure
		// why, since usually a div isn't focusable by default
		// TODO does this still apply now that it's a <ul> and not a <div>?
		return (
			<ul
				ref={ this.bindList }
				className="components-form-token-field__suggestions-list"
				id={ `components-form-token-suggestions-${ this.props.instanceId }` }
				role="listbox"
			>
				{
					map( this.props.suggestions, ( suggestion, index ) => {
						const match = this.computeSuggestionMatch( suggestion );
						const classeName = classnames( 'components-form-token-field__suggestion', {
							'is-selected': index === this.props.selectedIndex,
						} );

						/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
						return (
							<li
								id={ `components-form-token-suggestions-${ this.props.instanceId }-${ index }` }
								role="option"
								className={ classeName }
								key={ suggestion }
								onMouseDown={ this.handleMouseDown }
								onClick={ this.handleClick( suggestion ) }
								onMouseEnter={ this.handleHover( suggestion ) }
								aria-selected={ index === this.props.selectedIndex }
							>
								{ match ?
									(
										<span aria-label={ this.props.displayTransform( suggestion ) }>
											{ match.suggestionBeforeMatch }
											<strong className="components-form-token-field__suggestion-match">
												{ match.suggestionMatch }
											</strong>
											{ match.suggestionAfterMatch }
										</span>
									) :
									this.props.displayTransform( suggestion )
								}
							</li>
						);
						/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
					} )
				}
			</ul>
		);
	}
}

SuggestionsList.defaultProps = {
	match: '',
	onHover: () => {},
	onSelect: () => {},
	suggestions: Object.freeze( [] ),
};

export default SuggestionsList;
