/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SITE_BLOCKS from './site-blocks';

const CustomizeBlock = props => {
	const Component = SITE_BLOCKS.find( block => block.id === props.id ).customizeComponent;

	if ( ! Component ) {
		return <div>No customization for { props.id }</div>;
	}

	return <Component />;
};

PreviewBlock.props = {
	id: React.PropTypes.number.isRequired
};

export default props => <div>
	<h1>Customize content</h1>

	{
		SITE_BLOCKS
			.filter( () => true ) // only selected blocks
			.map( block => <CustomizeBlock id={ block.id } />
			)
	}
	<div className="button-container">
		<Button primary={ true } onClick={ () => page( '/pandance/blocks' ) }>Save</Button>
	</div>
</div>;
