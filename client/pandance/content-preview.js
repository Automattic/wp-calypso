/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import SITE_BLOCKS from './site-blocks';

const PreviewBlock = props => {
	const Component = SITE_BLOCKS.find( block => block.id === props.id ).component;

	if ( ! Component ) {
		return <div>No preview for { props.id }</div>;
	}

	return <Component />;
};

PreviewBlock.props = {
	id: React.PropTypes.number.isRequired
};

export default props => <div>
	<h1>Content preview</h1>

	{
		SITE_BLOCKS
			.filter( () => true ) // only selected blocks
			.map( block => <PreviewBlock id={ block.id } />
		)
	}

	<Button primary={ true } onClick={ () => page( '/pandance/blocks' ) }>Next</Button>
</div>;
