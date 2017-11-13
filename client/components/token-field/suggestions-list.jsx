/** @format */

/**
 * External dependencies
 */

import { map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';

class SuggestionsList extends React.PureComponent {
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
		onHover: function() {},
		onSelect: function() {},
		suggestions: Object.freeze( [] ),
	};

	componentDidUpdate( prevProps ) {
		var node;

		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if (
			prevProps.isExpanded &&
			this.props.isExpanded &&
			this.props.selectedIndex > -1 &&
			this.props.scrollIntoView
		) {
			this._scrollingIntoView = true;
			node = this.refs.list;

			scrollIntoView( node.children[ this.props.selectedIndex ], node, {
				onlyScrollIfNeeded: true,
			} );

			setTimeout(
				function() {
					this._scrollingIntoView = false;
				}.bind( this ),
				100
			);
		}
	}

	_computeSuggestionMatch = suggestion => {
		var match = this.props.displayTransform( this.props.match || '' ).toLocaleLowerCase(),
			indexOfMatch;

		if ( match.length === 0 ) {
			return null;
		}

		suggestion = this.props.displayTransform( suggestion );
		indexOfMatch = suggestion.toLocaleLowerCase().indexOf( match );

		return {
			suggestionBeforeMatch: suggestion.substring( 0, indexOfMatch ),
			suggestionMatch: suggestion.substring( indexOfMatch, indexOfMatch + match.length ),
			suggestionAfterMatch: suggestion.substring( indexOfMatch + match.length ),
		};
	};

	render() {
		var classes = classNames( 'token-field__suggestions-list', {
			'is-expanded': this.props.isExpanded && this.props.suggestions.length > 0,
		} );

		// We set `tabIndex` here because otherwise Firefox sets focus on this
		// div when tabbing off of the input in `TokenField` -- not really sure
		// why, since usually a div isn't focusable by default
		// TODO does this still apply now that it's a <ul> and not a <div>?
		return (
			<ul ref="list" className={ classes } tabIndex="-1">
				{ this._renderSuggestions() }
			</ul>
		);
	}

	_renderSuggestions = () => {
		return map(
			this.props.suggestions,
			function( suggestion, index ) {
				var match = this._computeSuggestionMatch( suggestion ),
					classes = classNames( 'token-field__suggestion', {
						'is-selected': index === this.props.selectedIndex,
					} );

				return (
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
			}.bind( this )
		);
	};

	_handleHover = suggestion => {
		return function() {
			if ( ! this._scrollingIntoView ) {
				this.props.onHover( suggestion );
			}
		}.bind( this );
	};

	_handleClick = suggestion => {
		return function() {
			this.props.onSelect( suggestion );
		}.bind( this );
	};

	_handleMouseDown = e => {
		// By preventing default here, we will not lose focus of <input> when clicking a suggestion
		e.preventDefault();
	};
}

export default SuggestionsList;
