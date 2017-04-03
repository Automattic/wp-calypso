/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/***
 * Internal Dependencies
 */
import Card from 'components/card';
import Ribbon from 'components/ribbon';
import Button from 'components/button';
import SITE_BLOCKS from './site-blocks';

class BlockItem extends React.Component {

	handleClick = () => {
		this.props.onBlockToggle( this.props.id );
	};

	render() {
		return <Card onClick={ this.handleClick }>
			{ this.props.isSelected && <Ribbon>Selected</Ribbon> }
			<p>{ this.props.name }</p>
		</Card>;
	}
}

export default class Blocks extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			selectedBlocks: new Set()
		};

		this.boundOnBlockToggle = this.onBlockToggle.bind( this );
	}

	onBlockToggle( id ) {

		if ( this.state.selectedBlocks.has( id ) ) {
			this.state.selectedBlocks.delete( id );
		} else {
			this.state.selectedBlocks.add( id );
		}

		this.setState( {
			selectedBlocks: this.state.selectedBlocks
		} )
	}

	render() {
		return <div>
				{
					SITE_BLOCKS.map( block => <BlockItem
						id={ block.id }
						name={ block.name }
						isSelected={ this.state.selectedBlocks.has( block.id ) }
						onBlockToggle={ this.boundOnBlockToggle } />
					)
				}
			<Button primary={ true } onClick={ () => page( '/pandance/content-preview' ) }>Next</Button>
		</div>;
	}
}
