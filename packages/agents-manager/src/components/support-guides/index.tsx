import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import {
	Button,
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	Spinner,
} from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import useHelpSearchQuery from '../../hooks/use-help-search-query';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

interface SearchResultsProps {
	searchInput: string;
}

function SearchResults( { searchInput }: SearchResultsProps ) {
	const trimmedInput = searchInput.trim();
	const { data, isFetching, isError, refetch } = useHelpSearchQuery( trimmedInput );

	if ( ! trimmedInput ) {
		return (
			<div className="agent-manager-support-guides__status">
				{ __( 'Search guides to find answers to your questions.', '__i18n_text_domain__' ) }
			</div>
		);
	}

	if ( isFetching ) {
		return (
			<div className="agent-manager-support-guides__status">
				<Spinner />
			</div>
		);
	}

	if ( isError ) {
		return (
			<div className="agent-manager-support-guides__status">
				{ __( 'Something went wrong.', '__i18n_text_domain__' ) }{ ' ' }
				<Button
					className="agent-manager-support-guides__retry"
					variant="link"
					onClick={ () => refetch() }
				>
					{ __( 'Try again', '__i18n_text_domain__' ) }
				</Button>
			</div>
		);
	}

	if ( ! data?.length ) {
		return (
			<div className="agent-manager-support-guides__status">
				{ __( 'No results found.', '__i18n_text_domain__' ) }
			</div>
		);
	}

	return (
		<ItemGroup isSeparated isBordered isRounded>
			{ data?.map( ( item ) => (
				<Item key={ item.post_id }>
					<Link
						to={ `/post?link=${ encodeURIComponent( item.link ) }` }
						state={ { searchQuery: trimmedInput } }
					>
						{ item.title }
					</Link>
				</Item>
			) ) }
		</ItemGroup>
	);
}

interface SupportGuidesProps {
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
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
}

export default function SupportGuides( {
	isOpen,
	chatHeaderOptions,
	isDocked,
	onAbort,
	onClose,
	onExpand,
}: SupportGuidesProps ) {
	const { state } = useLocation();
	const [ searchInput, setSearchInput, debouncedSearchInput ] = useDebouncedInput(
		state?.searchQuery ?? ''
	);
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
			floatingChatState={ isOpen ? 'expanded' : 'minimized' }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			expandOnHover={ false }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ __( 'Support Guides', '__i18n_text_domain__' ) }
				/>
				<VStack
					className="agent-manager-support-guides-wrapper"
					alignment="stretch"
					justify="stretch"
				>
					<SearchControl
						onChange={ setSearchInput }
						// The click event is highjacked by the drag-handlers of the floating chat container.
						onClick={ ( e ) => e.currentTarget.focus() }
						value={ searchInput }
					/>
					<SearchResults searchInput={ debouncedSearchInput } />
				</VStack>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
