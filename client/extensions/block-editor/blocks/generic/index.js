/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';
import classNames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';

import Gridicon from 'components/gridicon';
import Animate from 'components/animate';

const debug = debugFactory( 'calypso:block-editor:generic' );

class GenericBlock extends Component {
	static blockStyle = {
		margin: '8px 0',
		padding: '12px',
	};

	constructor( props ) {
		super( props );
		this.state = { selected: false };
		this.onBlockSelect = this.onBlockSelect.bind( this );
	}

	// fake impl
	innerText() {
		if ( this.props.type === 'Text' ) {
			return this.props.children
				.filter( c => c && c.type === 'Text' )
				.map( c => c.value )
				.join( '\n' );
		}

		return <div dangerouslySetInnerHTML={ {
			__html: this.props.rawContent
		} } />;
	}

	onBlockSelect() {
		this.setState( {
			selected: ! this.state.selected
		} );
	}

	handleClickOutside() {
		this.setState( { selected: false } );
	}

	render() {
		const classes = classNames( 'block', {
			'is-selected': this.state.selected
		} );
		debug( 'block', this.props );
		return (
			<div className={ classes } style={ GenericBlock.blockStyle } onClick={ this.onBlockSelect }>
				{ this.innerText() }
				{ this.state.selected &&
					<div className="block__controls">
						<Animate type="appear">
							<Gridicon icon="chevron-up" />
							<Gridicon icon="chevron-down" />
						</Animate>
					</div>
				}
			</div>
		);
	}
}

export default enhanceWithClickOutside( GenericBlock );
