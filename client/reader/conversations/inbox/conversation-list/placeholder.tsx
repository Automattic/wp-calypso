import { speak } from '@wordpress/a11y';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';
import type { Density } from './toolbar';

const ROWS = 8;
const TITLE_WIDTHS = [ '72%', '58%', '80%', '64%' ];

export function ConversationListPlaceholder( { density }: { density: Density } ) {
	const translate = useTranslate();

	// A live region rendered with its text already in it often isn't read out.
	useEffect( () => {
		speak( translate( 'Loading conversations…' ) as string );
	}, [ translate ] );

	return (
		<ul aria-hidden="true" className="conversations-inbox__placeholder">
			{ Array.from( { length: ROWS }, ( _, index ) => (
				<li key={ index }>
					<VStack spacing={ 2.5 } className="conversations-inbox__item">
						<HStack>
							<Skeleton height="16px" width={ TITLE_WIDTHS[ index % TITLE_WIDTHS.length ] } />
							<Skeleton height="14px" width="32px" />
						</HStack>
						{ density !== 'compact' && (
							<HStack justify="flex-start">
								<Skeleton shape="circle" height="24px" width="24px" />
								<Skeleton height="14px" width="50%" />
							</HStack>
						) }
						{ density === 'comfortable' && <Skeleton height="14px" width="90%" /> }
					</VStack>
				</li>
			) ) }
		</ul>
	);
}
