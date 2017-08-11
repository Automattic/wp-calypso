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
		} ),
		hasHighlight: PropTypes.bool,
		searchTerm: PropTypes.string,
		onMouseDown: PropTypes.func,
		onMouseOver: PropTypes.func,
	};

	static defaultProps = {
		hasHighlight: false,
		searchTerm: '',
	};

	createTextWithHighlight( text, highlightedText ) {
		const re = new RegExp( '(' + highlightedText + ')', 'gi' );
		const parts = text.split( re );
		const token = parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			if ( lowercasePart === highlightedText ) {
				return <span key={ key } className="search-autocomplete__text is-emphasized" >{ part }</span>;
			}
			return <span key={ key } className="search-autocomplete__text" >{ part }</span>;
		} );

		return token;
	}

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		if ( this.props.onMouseDown ) {
			this.props.onMouseDown( this.props.post.slug );
		}
	}

	handleMouseOver = () => {
		if ( this.props.onMouseOver ) {
			this.props.onMouseOver( this.props.post.slug );
		}
	}

	render() {
		const { hasHighlight, post, searchTerm } = this.props;

		const className = classNames(
			'search-autocomplete__suggestion',
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
