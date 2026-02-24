import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import {
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	Spinner,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

/**
 * Stub for useHelpSearchQuery.
 * TODO: Implement actual search functionality when adding support for support guides.
 * This was previously imported from @automattic/help-center but removed to decouple packages.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useHelpSearchQuery( query: string, locale: string, sectionName: string ) {
	return {
		data: [] as Array< { post_id: number; link: string; title: string } >,
		isFetching: false,
	};
}

function SearchResults( { searchInput }: { searchInput: string } ) {
	const { data: searchData, isFetching: isSearching } = useHelpSearchQuery(
		searchInput,
		getLocaleSlug() ?? 'en',
		'sectionName'
	);
	if ( isSearching ) {
		return <Spinner />;
	}

	if ( ! searchData?.length ) {
		return (
			<div className="agent-manager-support-guides-no-results">
				{ __( 'No results found', '__i18n_text_domain__' ) }
			</div>
		);
	}

	return (
		<ItemGroup isSeparated isBordered isRounded>
			{ searchData?.map( ( item ) => (
				<Item key={ item.post_id }>
					<Link to={ `/post?link=${ item.link }` }>{ item.title }</Link>
				</Item>
			) ) }
		</ItemGroup>
	);
}

interface Props {
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
}

export default function SupportGuides( {
	isOpen,
	chatHeaderOptions,
	isDocked,
	onAbort,
	onClose,
}: Props ) {
	const [ searchInput, setSearchInput ] = useState( '' );
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => {} }
			variant={ isDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onStop={ onAbort }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ __( 'Support Guides', '__i18n_text_domain__' ) }
				/>
				<VStack
					className="agenttic agent-manager-support-guides-wrapper"
					alignment="stretch"
					justify="stretch"
				>
					<SearchControl
						onChange={ setSearchInput }
						// The click event is highjacked by the drag-handlers of the floating chat container.
						onClick={ ( e ) => e.currentTarget.focus() }
						value={ searchInput }
					/>
					<SearchResults searchInput={ searchInput } />
				</VStack>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
