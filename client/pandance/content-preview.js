/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SITE_BLOCKS from './site-blocks';

const PreviewBlock = props => {
	const Component = find( SITE_BLOCKS, block => block.id === props.id ).component;

	if ( ! Component ) {
		return <div>No preview for { props.id }</div>;
	}

	return <Component />;
};

PreviewBlock.props = {
	id: React.PropTypes.number.isRequired
};

export default props => <div style={ { maxWidth: '800px', margin: '0 auto' } }>

	<h1>Content preview</h1>
	<Button primary={ true } onClick={ () => page( '/pandance/customize' ) }>Customize</Button>
	<p>Here is what your website will look like:</p>
	<Card>
	{
		SITE_BLOCKS
			.filter( () => true ) // only selected blocks
			.map( block => <PreviewBlock id={ block.id } />
		)
	}
	</Card>
	<Button primary={ true } onClick={ () => page( '/pandance/blocks' ) }>Next</Button>
</div>;
