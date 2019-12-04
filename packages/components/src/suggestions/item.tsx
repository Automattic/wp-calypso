/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

interface Props {
	hasHighlight: boolean;
	label: string;
	onMount: () => void;
	onMouseDown: () => void;
	onMouseOver: () => void;
	query: string;
}

class Item extends PureComponent< Props > {
	static propTypes = {
		label: PropTypes.string.isRequired,
		hasHighlight: PropTypes.bool,
		query: PropTypes.string,
		onMount: PropTypes.func.isRequired,
		onMouseDown: PropTypes.func.isRequired,
		onMouseOver: PropTypes.func.isRequired,
	};

	static defaultProps = {
		hasHighlight: false,
		query: '',
	};

	componentDidMount() {
		this.props.onMount();
	}

	/**
	 * Highlights the part of the text that matches the query.
	 *
	 * @param   text  Text.
	 * @param   query The text to be matched.
	 * @returns       A React element including the highlighted text.
	 */
	createTextWithHighlight( text: string, query: string ) {
		const re = new RegExp( '(' + query + ')', 'gi' );
		const parts = text.split( re );

		return parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			const spanClass = classNames( 'suggestions__label', {
				'is-emphasized': lowercasePart === query.toLowerCase(),
			} );

			return (
				<span key={ key } className={ spanClass }>
					{ part }
				</span>
			);
		} );
	}

	handleMouseDown = event => {
		event.stopPropagation();
		event.preventDefault();
		this.props.onMouseDown();
	};

	handleMouseOver = () => {
		this.props.onMouseOver();
	};

	render() {
		const { hasHighlight, label, query } = this.props;

		const className = classNames( 'suggestions__item', { 'has-highlight': hasHighlight } );

		return (
			<button
				className={ className }
				onMouseDown={ this.handleMouseDown }
				onFocus={ this.handleMouseDown }
				onMouseOver={ this.handleMouseOver }
			>
				{ this.createTextWithHighlight( label, query ) }
			</button>
		);
	}
}

export default Item;
