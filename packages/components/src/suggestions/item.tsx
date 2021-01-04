/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import type { MouseEvent, FocusEvent, ReactNode } from 'react';
import classNames from 'classnames';
import { escapeRegExp } from 'lodash';

function escapeRegExpWithSpace( str: string ) {
	return escapeRegExp( str ).replace( /\s/g, '\\s' );
}

interface Props {
	label: string;
	hasHighlight?: boolean;
	query: string;
	onMount: () => void;
	onMouseDown: () => void;
	onMouseOver: () => void;
}
class Item extends PureComponent< Props > {
	static defaultProps = {
		hasHighlight: false,
		query: '',
	};

	componentDidMount(): void {
		this.props.onMount();
	}

	/**
	 * Highlights the part of the text that matches the query.
	 *
	 * @param  {string} text  Text.
	 * @param  {string} query The text to be matched.
	 *
	 * @returns {Array< ReactElement< JSX.IntrinsicElements[ 'span' ] > >} An element including the highlighted text.
	 */
	createTextWithHighlight( text: string, query: string ): ReactNode {
		const re = new RegExp( '(' + escapeRegExpWithSpace( query ) + ')', 'gi' );
		const parts = text.split( re );

		// Replaces char code 160 (&nbsp;) with 32 (space)
		const match = query.toLowerCase().replace( /\s/g, ' ' );

		return parts.map( ( part, i ) => {
			const key = text + i;
			const lowercasePart = part.toLowerCase();
			const spanClass = classNames( 'suggestions__label', {
				'is-emphasized': lowercasePart === match,
			} );

			return (
				<span key={ key } className={ spanClass }>
					{ part }
				</span>
			);
		} );
	}

	handleMouseDown = (
		event: MouseEvent< HTMLButtonElement > | FocusEvent< HTMLButtonElement >
	): void => {
		event.stopPropagation();
		event.preventDefault();
		this.props.onMouseDown();
	};

	handleMouseOver = (): void => {
		this.props.onMouseOver();
	};

	render(): JSX.Element {
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
