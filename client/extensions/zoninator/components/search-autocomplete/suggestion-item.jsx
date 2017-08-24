/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class SuggestionItem extends Component {

	static propTypes = {
		post: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
		} ).isRequired,
		hasHighlight: PropTypes.bool,
		searchTerm: PropTypes.string,
		onMouseDown: PropTypes.func,
		onMouseOver: PropTypes.func,
	};

	static defaultProps = {
		hasHighlight: false,
		searchTerm: '',
	};

	/**
	 * Highlights the matching parts of the string.
	 * @param  {string} text            Text.
	 * @param  {string} highlightedText The text to be matched.
	 * @return {element}                A React element including the highlighted text.
	 */
	createTextWithHighlight( text, highlightedText ) {
		const re = new RegExp( '(' + highlightedText + ')', 'gi' );
		const parts = text.split( re );

		return parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			const spanClass = classNames( 'zoninator__search-autocomplete__text', {
				'is-emphasized': lowercasePart === highlightedText,
			} );

			return <span key={ key } className={ spanClass } >{ part }</span>;
		} );
	}

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		this.props.onMouseDown && this.props.onMouseDown( this.props.post.slug );
	}

	handleMouseOver = () => {
		this.props.onMouseOver && this.props.onMouseOver( this.props.post.slug );
	}

	render() {
		const { hasHighlight, post, searchTerm } = this.props;

		const className = classNames(
			'zoninator__search-autocomplete__suggestion',
			{ 'has-highlight': hasHighlight }
		);

		return (
			<span
				className={ className }
				onMouseDown={ this.handleMouseDown }
				onMouseOver={ this.handleMouseOver }>
				{ this.createTextWithHighlight( post.title, searchTerm ) }
			</span>
		);
	}
}

export default SuggestionItem;
