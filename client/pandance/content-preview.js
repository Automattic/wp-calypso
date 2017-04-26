/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { find } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SITE_BLOCKS from './site-blocks';

const PreviewBlock = props => {
	console.log( SITE_BLOCKS, props );
	const Component = find( SITE_BLOCKS, block => block.id === props.id ).component;

	if ( ! Component ) {
		return <div>No preview for { props.id }</div>;
	}

	return <Component />;
};

PreviewBlock.props = {
	id: React.PropTypes.number.isRequired
};

export const ContentPreview = props => <div className="content-preview">
	<div className="message">
		<div className="message-inside">
			<p>Here is a preview of your site with the things you wanted to see on it. Take a look, then lets get a bit more info from you to make it your own.</p>
			<p><Button primary={ true } onClick={ () => page( '/pandance/customize' ) }>Customize</Button></p>
		</div>
	</div>
	<div className="content-container">
	{
		SITE_BLOCKS
			.filter( block => props.selected.includes( block.id ) )
			.map( block => <PreviewBlock id={ block.id } />
		)
	}
	</div>
</div>;

export default connect( ( state, props ) => ( {
	selected: state.pandance.selected,
} ) )( ContentPreview );
