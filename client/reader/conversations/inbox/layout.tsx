import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { Density } from './conversation-list/toolbar';
import type { ReactNode, Ref } from 'react';

import './style.scss';

export const DENSITY_PREFERENCE = 'reader_conversations_inbox_density';

// The Reader sidebar (~272px) and the 372px list leave the detail pane about 540px at this width.
// It has to be one @automattic/viewport defines, or useBreakpoint never matches.
const SINGLE_PANE_BREAKPOINT = '<1180px';

export const useIsNarrowInbox = () => useBreakpoint( SINGLE_PANE_BREAKPOINT );

export const useInboxDensity = (): Density =>
	useSelector( ( state ) => getPreference( state, DENSITY_PREFERENCE ) ?? 'comfortable' );

export function ConversationsInboxLayout( {
	isNarrow,
	hasConversation,
	ref,
	children,
}: {
	isNarrow: boolean;
	hasConversation: boolean;
	ref?: Ref< HTMLDivElement >;
	children: ReactNode;
} ) {
	return (
		<ReaderMain className="conversations-inbox-main no-padding" wideLayout>
			<HStack
				ref={ ref }
				spacing={ 0 }
				alignment="stretch"
				justify="flex-start"
				className={ clsx( 'conversations-inbox', {
					'is-narrow': isNarrow,
					'is-showing-detail': isNarrow && hasConversation,
				} ) }
			>
				{ children }
			</HStack>
		</ReaderMain>
	);
}
