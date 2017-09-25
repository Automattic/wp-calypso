/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

class Item extends PureComponent {

	static propTypes = {
		label: PropTypes.string.isRequired,
		hasHighlight: PropTypes.bool,
		query: PropTypes.string,
		onMouseDown: PropTypes.func.isRequired,
		onMouseOver: PropTypes.func.isRequired,
	};

	static defaultProps = {
		hasHighlight: false,
		query: '',
	};

	/**
	 * Highlights the part of the text that matches the query.
	 * @param  {string} text  Text.
	 * @param  {string} query The text to be matched.
	 * @return {element}      A React element including the highlighted text.
	 */
	createTextWithHighlight( text, query ) {
		const re = new RegExp( '(' + query + ')', 'gi' );
		const parts = text.split( re );

		return parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			const spanClass = classNames( 'suggestions__label', {
				'is-emphasized': lowercasePart === query,
			} );

			return <span key={ key } className={ spanClass } >{ part }</span>;
		} );
	}

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		this.props.onMouseDown( this.props.label );
	}

	handleMouseOver = () => {
		this.props.onMouseOver( this.props.label );
	}

	render() {
		const { hasHighlight, label, query } = this.props;

		const className = classNames(
			'suggestions__item',
			{ 'has-highlight': hasHighlight }
		);

		return (
			<span
				className={ className }
				onMouseDown={ this.handleMouseDown }
				onMouseOver={ this.handleMouseOver }>
				{ this.createTextWithHighlight( label, query ) }
			</span>
		);
	}
}

export default Item;
