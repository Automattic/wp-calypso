import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useHelpSearchQuery } from '@automattic/help-center/src/hooks/use-help-search-query';
import {
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	Spinner,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { Options } from '../chat-header';
import './style.scss';

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

export default function SupportGuides( {
	isOpen,
	chatHeaderOptions,
	isChatDocked,
	onAbort,
	onClose,
}: {
	chatHeaderOptions: Options;
	isChatDocked: boolean;
	isOpen: boolean;
	onAbort: () => void;
	onClose: () => void;
} ) {
	const [ searchInput, setSearchInput ] = useState( '' );
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	function handleSubmit( value: string ) {
		// eslint-disable-next-line no-console
		console.log( 'Submitted message:', value );
	}

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			className="agenttic"
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ handleSubmit }
			variant={ isChatDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onStop={ onAbort }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isChatDocked }
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
