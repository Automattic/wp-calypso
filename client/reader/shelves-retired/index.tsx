import page from '@automattic/calypso-router';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { SHELVES_RETIRED_QUERY_ARG, SHELVES_RETIRED_QUERY_VALUE } from './constants';

export function ShelvesRetiredModal() {
	const translate = useTranslate();
	// Read the route state rather than the URL: a redirect to the Following page
	// from within the app keeps this component mounted.
	const query = useSelector( getCurrentQueryArguments );
	// Every navigation sets a new query object, so a dismissal lasts until the next one.
	const [ dismissedQuery, setDismissedQuery ] = useState< typeof query >( null );

	if (
		query?.[ SHELVES_RETIRED_QUERY_ARG ] !== SHELVES_RETIRED_QUERY_VALUE ||
		query === dismissedQuery
	) {
		return null;
	}

	const close = () => {
		setDismissedQuery( query );
		// Drop the query arg without dispatching, so the page isn't rendered or tracked again.
		page.replace(
			removeQueryArgs(
				window.location.pathname + window.location.search,
				SHELVES_RETIRED_QUERY_ARG
			),
			null,
			false,
			false
		);
	};

	return (
		<Modal
			title={ translate( 'Shelves has been retired' ) as string }
			onRequestClose={ close }
			size="small"
		>
			<VStack spacing={ 6 }>
				<Text>
					{ translate(
						'Thanks for trying Shelves! We’ve retired it to focus on parts of the Reader that people use most often. Don’t worry, you still follow all the same sites and tags.'
					) }
				</Text>
				<HStack justify="flex-end">
					<Button __next40pxDefaultSize variant="primary" onClick={ close }>
						{ translate( 'Got it' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
