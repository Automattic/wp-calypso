import { useMobileBreakpoint } from '@automattic/viewport-react';
import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { updateFilter } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	siteId: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filter: any;
}

const TextSelector: FunctionComponent< Props > = ( { siteId, filter } ) => {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const [ searchQuery, setSearchQuery ] = useState( filter.textSearch || '' );
	const dispatch = useDispatch() as CalypsoDispatch;
	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		const { value } = event.currentTarget;

		if ( event.key === 'Enter' ) {
			dispatch( updateFilter( siteId, { textSearch: value } ) );
			dispatch(
				recordTracksEvent( 'calypso_activitylog_filterbar_text_search', {
					characters: value.length,
				} )
			);
		}
	};

	const onChange = ( value: string ) => {
		setSearchQuery( value );
	};

	const placeholder = isMobile
		? translate( 'Search posts' )
		: translate( 'Search posts by ID, title or author' );

	return (
		<TextControl
			__nextHasNoMarginBottom
			type="search"
			onKeyDown={ onKeyDown }
			placeholder={ placeholder }
			onChange={ onChange }
			value={ searchQuery }
		/>
	);
};

export default TextSelector;
