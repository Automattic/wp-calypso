/**
 * External
 */
import React from 'react';
import page from 'page';

/**
 * Internal
 */
import Button from 'components/button';

export default props => {
	const {
		editComponent,
		nextBlockId,
		component
	} = props;

	const EditComponent = editComponent;
	const Component = component;

	const next = () => {
		if ( nextBlockId ) {
			page( '/pandance/customize/' + nextBlockId );
		} else {
			page( '/pandance/content-preview' );
		}
	};

	return <div>
		<EditComponent next={ next }/>
		<Button
			primary={ true }
			onClick={ next }
		>Continue</Button>
	</div>
}
