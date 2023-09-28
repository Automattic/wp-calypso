import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	siteId: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filter: any;
}

const TextSearchControl: FunctionComponent< Props > = ( { siteId, filter } ) => {
	const [ text, setText ] = useState( filter.textSearch || '' );
	const dispatch = useDispatch() as CalypsoDispatch;
	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		const { value } = event.currentTarget;

		if ( event.key === 'Enter' ) {
			dispatch( updateFilter( siteId, { textSearch: value } ) );
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
