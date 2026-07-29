/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { columns } from '@wordpress/icons';

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
	isStale?: boolean;
}

/**
 * Suggest split-screen mode after a current review result.
 * @param props         Component props.
 * @param props.isStale Whether the containing result is no longer interactive.
 * @returns An inline chat suggestion, or null when the guide is not relevant.
 */
export default function SplitScreenGuide( { isStale = false }: SplitScreenGuideProps ) {
	const { isDocked, isSplitScreen } = useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelectors | undefined;
		return store?.getAgentsManagerState?.() ?? {};
	}, [] );
	const { setIsSplitScreen } = useDispatch(
		AGENTS_MANAGER_STORE
	) as unknown as AgentsManagerActions;

	if ( isStale || ! isDocked || isSplitScreen ) {
		return null;
	}

	return (
		<div className="jetpack-ai-split-screen-guide">
			<p className="jetpack-ai-split-screen-guide__message">
				{ __(
					'Before continuing, I recommend reviewing this feedback in split screen for a better experience. You can switch through the dropdown menu at the top of this chat, or clicking this button:',
					__i18n_text_domain__
				) }
			</p>
			<Button
				className="jetpack-ai-split-screen-guide__action"
				icon={ columns }
				iconPosition="right"
				onClick={ () => setIsSplitScreen( true ) }
			>
				{ __( 'Switch to split screen mode', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
