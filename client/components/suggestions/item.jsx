/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { tracks } from 'lib/analytics';

class Item extends PureComponent {
	static propTypes = {
		label: PropTypes.string.isRequired,
		hasHighlight: PropTypes.bool,
		query: PropTypes.string,
		onMouseDown: PropTypes.func.isRequired,
		onMouseOver: PropTypes.func.isRequired,
		railcar: PropTypes.object,
	};

	static defaultProps = {
		hasHighlight: false,
		query: '',
	};

	componentDidMount() {
		const { railcar } = this.props;
		if ( railcar ) {
			tracks.recordEvent(
				'calypso_traintracks_render',
				pick( railcar, [ 'railcar', 'fetch_algo', 'fetch_position' ] )
			);
		}
	}

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
		const { railcar } = this.props;

		event.stopPropagation();
		event.preventDefault();

		this.props.onMouseDown();
		if ( railcar ) {
			tracks.recordEvent(
				'calypso_traintracks_interact',
				pick( railcar, [ 'railcar', 'action' ] )
			);
		}
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
