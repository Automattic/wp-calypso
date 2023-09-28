import { TextControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import React, { FunctionComponent } from 'react';
import { updateFilter } from 'calypso/state/activity-log/actions';
interface Props {
	siteId: number;
}

const TextSearchControl: FunctionComponent< Props > = ( { siteId } ) => {
	const [ text, setText ] = useState( '' );
	const dispatch = useDispatch();

	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		const { value } = event.currentTarget;

		if ( event.key === 'Enter' ) {
			dispatch( updateFilter( siteId, { text_search: value } ) );

			// eslint-disable-next-line no-console
			console.log( 'Filtering text_search by ' + value );
		}
	};

	const onChange = ( value: string ) => {
		setText( value );
	};

	return (
		<TextControl
			__nextHasNoMarginBottom
			type="search"
			onKeyDown={ onKeyDown }
			placeholder="Search by post ID, title or author"
			onChange={ onChange }
			value={ text }
		/>
	);
};

export default TextSearchControl;
