import { speak } from '@wordpress/a11y';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Skeleton from 'calypso/reader/components/skeleton';

import '../placeholder.scss';
import './style.scss';

const COMMENTS = 3;

/** Stands in for the post card and its first comments while the post loads. */
export function ConversationContentPlaceholder( { announce = true }: { announce?: boolean } ) {
	const translate = useTranslate();

	// A live region rendered with its text already in it often isn't read out.
	useEffect( () => {
		if ( announce ) {
			speak( translate( 'Loading conversation…' ) as string );
		}
	}, [ announce, translate ] );

	return (
		<VStack spacing={ 10 } aria-hidden="true">
			<VStack spacing={ 3 } className="conversations-inbox__post-card">
				<HStack spacing={ 3 } justify="flex-start">
					<Skeleton shape="circle" height="28px" width="28px" />
					<Skeleton height="14px" width="140px" />
					<Skeleton height="14px" width="80px" />
				</HStack>
				<HStack spacing={ 6 } alignment="top">
					<VStack spacing={ 2 } className="conversations-inbox__placeholder-text">
						<Skeleton height="24px" width="70%" />
						<Skeleton height="14px" width="100%" />
						<Skeleton height="14px" width="60%" />
					</VStack>
					<Skeleton height="72px" width="108px" />
				</HStack>
			</VStack>
			<VStack spacing={ 8 }>
				{ Array.from( { length: COMMENTS }, ( _, index ) => (
					<HStack key={ index } spacing={ 3 } alignment="top">
						<Skeleton shape="circle" height="32px" width="32px" />
						<VStack spacing={ 2.5 } className="conversations-inbox__placeholder-text">
							<Skeleton height="14px" width="120px" />
							<Skeleton height="14px" width="100%" />
							<Skeleton height="14px" width="60%" />
						</VStack>
					</HStack>
				) ) }
			</VStack>
		</VStack>
	);
}

/** Holds the detail pane's place while the list loads, before there's a conversation to open. */
export function ConversationDetailPlaceholder() {
	return (
		<VStack spacing={ 0 } className="conversations-inbox__detail-pane">
			<HStack
				expanded={ false }
				aria-hidden="true"
				className="conversations-inbox__detail-header is-placeholder"
			>
				<Skeleton height="20px" width="180px" />
			</HStack>
			<div className="conversations-inbox__detail-body">
				<VStack className="conversations-inbox__detail-content">
					{ /* Only holds the pane's place while the list loads, which announces itself. */ }
					<ConversationContentPlaceholder announce={ false } />
				</VStack>
			</div>
		</VStack>
	);
}
