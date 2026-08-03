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
	isStale?: boolean;
}

/**
 * Suggest split-screen mode after a current review result.
 * @param props               Component props.
 * @param props.componentType Existing show-component type for tracking.
 * @param props.isStale       Whether the containing result is no longer interactive.
 * @returns An inline chat suggestion, or null when the guide is not relevant.
 */
export default function SplitScreenGuide( {
	componentType,
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
		trackSplitScreenGuideRendered( { componentType } );
		hasTrackedRenderRef.current = true;
	}, [ componentType, isVisible ] );

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
					trackSplitScreenGuideClick( { componentType } );
					setIsSplitScreen( true );
				} }
			>
				{ __( 'Switch to split screen mode', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
