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
import { hasAiChatEntryButton } from '../../hooks/use-admin-bar-integration';
import useHelpSearchQuery from '../../hooks/use-help-search-query';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

interface SearchResultsProps {
	searchInput: string;
}

function SearchResults( { searchInput }: SearchResultsProps ) {
	const trimmedInput = searchInput.trim();
	// An empty input returns recommended guides from the API.
	const isRecommended = ! trimmedInput;
	const { data, isFetching, isError, refetch } = useHelpSearchQuery( trimmedInput );

	if ( isFetching ) {
		return (
			<div className="agent-manager-support-guides__status">
				<Spinner />
			</div>
		);
	}

	if ( isError ) {
		// If recommended guides fail to load, show the search prompt instead of an error.
		if ( isRecommended ) {
			return (
				<div className="agent-manager-support-guides__status">
					{ __( 'Search guides to find answers to your questions.', '__i18n_text_domain__' ) }
				</div>
			);
		}

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
		<>
			<h3 className="agent-manager-support-guides__title">
				{ isRecommended
					? __( 'Recommended Guides', '__i18n_text_domain__' )
					: __( 'Search Results', '__i18n_text_domain__' ) }
			</h3>
			<ItemGroup isSeparated isBordered isRounded>
				{ data?.map( ( item ) => (
					// `post_id` is optional, so fall back to keep keys unique and defined.
					<Item key={ item.post_id ?? item.link ?? item.title }>
						<Link
							to={ `/post?link=${ encodeURIComponent( item.link ) }` }
							state={ { searchQuery: trimmedInput } }
						>
							{ item.title }
						</Link>
					</Item>
				) ) }
			</ItemGroup>
		</>
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
	const { setFloatingPosition, setFreeDragPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	// Without the AI chat entry button, use `collapsed` (a FAB) instead of `minimized`.
	const closedChatState = hasAiChatEntryButton() ? 'minimized' : 'collapsed';
	const title = __( 'Support Guides', '__i18n_text_domain__' );

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			initialFreeDragPosition={ freeDragPosition ?? undefined }
			onFreeDragEnd={ setFreeDragPosition }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => {} }
			variant={ isDocked ? 'embedded' : 'floating' }
			freeDrag={ ! isDocked }
			floatingChatState={ isOpen ? 'expanded' : closedChatState }
			triggerTitle={ title }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			expandOnHover={ false }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ title }
					isDocked={ isDocked }
				/>
				<VStack
					className="agent-manager-support-guides-wrapper"
					alignment="stretch"
					justify="stretch"
				>
					<SearchControl
						placeholder={ __( 'Search guides…', '__i18n_text_domain__' ) }
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
