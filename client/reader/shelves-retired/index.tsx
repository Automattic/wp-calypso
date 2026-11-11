import page from '@automattic/calypso-router';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { SHELVES_RETIRED_QUERY_ARG, SHELVES_RETIRED_QUERY_VALUE } from './constants';

function arrivedFromShelvesLink(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return (
		getQueryArg( window.location.href, SHELVES_RETIRED_QUERY_ARG ) === SHELVES_RETIRED_QUERY_VALUE
	);
}

export function ShelvesRetiredModal() {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( arrivedFromShelvesLink );

	if ( ! isOpen ) {
		return null;
	}

	const close = () => {
		setIsOpen( false );
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
			title={ translate( 'Shelves have been retired' ) as string }
			onRequestClose={ close }
			size="small"
		>
			<VStack spacing={ 6 }>
				<Text>
					{ translate(
						'We’ve removed Shelves from the Reader. You still follow all the same sites and tags.'
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
