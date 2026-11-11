/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { columns } from '@wordpress/icons';
import { trackSplitScreenGuideClick, trackSplitScreenGuideRendered } from '../utils/tracking';

const AGENTS_MANAGER_STORE = 'automattic/agents-manager';

type AgentsManagerSelectors = {
	getAgentsManagerState: () => {
		isDocked?: boolean;
		isSplitScreen?: boolean;
	};
};

type AgentsManagerActions = {
	setIsSplitScreen: ( isSplitScreen: boolean ) => void;
};

interface SplitScreenGuideProps {
	componentType: string;
	toolCallId?: string;
	isStale?: boolean;
}

/**
 * Suggest split-screen mode after a current review result.
 * @param props               Component props.
 * @param props.componentType Existing show-component type for tracking.
 * @param props.toolCallId    Tool call that produced the containing response, for tracking.
 * @param props.isStale       Whether the containing result is no longer interactive.
 * @returns An inline chat suggestion, or null when the guide is not relevant.
 */
export default function SplitScreenGuide( {
	componentType,
	toolCallId,
	isStale = false,
}: SplitScreenGuideProps ) {
	const { isDocked, isSplitScreen } = useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelectors | undefined;
		return store?.getAgentsManagerState?.() ?? {};
	}, [] );
	const { setIsSplitScreen } = useDispatch(
		AGENTS_MANAGER_STORE
	) as unknown as AgentsManagerActions;
	const isVisible = ! isStale && !! isDocked && ! isSplitScreen;
	const hasTrackedRenderRef = useRef( false );

	useEffect( () => {
		if ( ! isVisible || hasTrackedRenderRef.current ) {
			return;
		}
		if ( trackSplitScreenGuideRendered( { componentType, toolCallId } ) ) {
			hasTrackedRenderRef.current = true;
			return;
		}
		// The dock republishes the bridge recorder on every commit
		// (delete-then-reassign), so a same-commit effect can catch the gap.
		// Retry on the next task, and again if Agents Manager loads later.
		const retry = () => {
			if ( ! hasTrackedRenderRef.current ) {
				hasTrackedRenderRef.current = trackSplitScreenGuideRendered( {
					componentType,
					toolCallId,
				} );
			}
		};
		const retryTimer = window.setTimeout( retry, 0 );
		window.addEventListener( 'agents-manager-ready', retry );
		return () => {
			window.clearTimeout( retryTimer );
			window.removeEventListener( 'agents-manager-ready', retry );
		};
	}, [ componentType, isVisible, toolCallId ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<div className="jetpack-ai-split-screen-guide">
			<p className="jetpack-ai-split-screen-guide__message">
				{ __(
					'For a better read of this feedback, switch to split screen. Use the menu at the top of this chat, or this button:',
					__i18n_text_domain__
				) }
			</p>
			<Button
				className="jetpack-ai-split-screen-guide__action"
				icon={ columns }
				iconPosition="right"
				onClick={ () => {
					trackSplitScreenGuideClick( { componentType, toolCallId } );
					setIsSplitScreen( true );
				} }
			>
				{ __( 'Switch to split screen mode', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
