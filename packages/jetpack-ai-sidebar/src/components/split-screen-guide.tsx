/**
 * WordPress dependencies
 */
import { Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const AGENTS_MANAGER_STORE = 'automattic/agents-manager';
const DISMISSED_STORAGE_KEY = 'jetpack-ai-sidebar-split-screen-guide-dismissed';

type AgentsManagerSelectors = {
	getAgentsManagerState: () => {
		isDocked?: boolean;
		isSplitScreen?: boolean;
	};
};

type AgentsManagerActions = {
	setIsSplitScreen: ( isSplitScreen: boolean ) => void;
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		openChatMoreOptions?: () => void;
	};
};

interface SplitScreenGuideProps {
	isStale?: boolean;
}

function wasDismissed(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	try {
		return window.localStorage.getItem( DISMISSED_STORAGE_KEY ) === '1';
	} catch {
		return false;
	}
}

function persistDismissal(): void {
	try {
		window.localStorage.setItem( DISMISSED_STORAGE_KEY, '1' );
	} catch {
		// The in-memory state still dismisses the guide when storage is unavailable.
	}
}

/**
 * Suggest split-screen mode after a current review result.
 * @param props         Component props.
 * @param props.isStale Whether the containing result is no longer interactive.
 * @returns A native WordPress notice, or null when the guide is not relevant.
 */
export default function SplitScreenGuide( { isStale = false }: SplitScreenGuideProps ) {
	const [ isVisible, setIsVisible ] = useState( () => ! wasDismissed() );
	const { isDocked, isSplitScreen } = useSelect( ( select ) => {
		const store = select( AGENTS_MANAGER_STORE ) as AgentsManagerSelectors | undefined;
		return store?.getAgentsManagerState?.() ?? {};
	}, [] );
	const { setIsSplitScreen } = useDispatch(
		AGENTS_MANAGER_STORE
	) as unknown as AgentsManagerActions;

	const dismiss = useCallback( () => {
		setIsVisible( false );
		persistDismissal();
	}, [] );

	if ( ! isVisible || isStale || ! isDocked || isSplitScreen ) {
		return null;
	}

	return (
		<Notice
			className="jetpack-ai-split-screen-guide"
			status="info"
			onRemove={ dismiss }
			actions={ [
				{
					label: __( 'Switch', __i18n_text_domain__ ),
					variant: 'primary',
					onClick: () => {
						setIsSplitScreen( true );
						dismiss();
					},
				},
				{
					label: __( 'Show', __i18n_text_domain__ ),
					variant: 'secondary',
					onClick: () => {
						(
							window as WindowWithAgentsManagerActions
						 ).__agentsManagerActions?.openChatMoreOptions?.();
						dismiss();
					},
				},
			] }
		>
			<strong>{ __( 'Tip:', __i18n_text_domain__ ) }</strong>{ ' ' }
			{ __( 'Review this feedback in split screen for better experience', __i18n_text_domain__ ) }
		</Notice>
	);
}
