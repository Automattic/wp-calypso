/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/***
 * Internal Dependencies
 */
import Card from 'components/card';
import Ribbon from 'components/ribbon';
import Button from 'components/button';
import { toggleBlock } from 'state/pandance/actions';
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

export class Blocks extends React.Component {
	constructor( props ) {
		super( props );

		this.boundOnBlockToggle = this.onBlockToggle.bind( this );
	}

	onBlockToggle( id ) {
		this.props.toggleBlock( id );
	}

	render() {
		return <div>
				{
					SITE_BLOCKS.map( block => <BlockItem
						id={ block.id }
						name={ block.name }
						isSelected={ this.props.selected.includes( block.id ) }
						onBlockToggle={ this.boundOnBlockToggle } />
					)
				}
			<Button primary={ true } onClick={ () => page( '/pandance/content-preview' ) }>Next</Button>
		</div>;
	}
}

export default connect( ( state, props ) => ( {
	selected: state.pandance.selected,
} ), dispatch => bindActionCreators( { toggleBlock }, dispatch ) )( Blocks );
