import * as Tooltip from '@radix-ui/react-tooltip';
import * as React from 'react';
import styles from './SuggestionTooltip.module.css';

export interface SuggestionTooltipProps {
	label: string;
	/**
	 * Id of the hidden copy of `label`. The chip inside must point its
	 * `aria-describedby` at it, since Radix describes the trigger element rather
	 * than the button within, and only while the tooltip is open.
	 */
	descriptionId: string;
	children: React.ReactNode;
}

/**
 * Wraps a suggestion chip so hovering or focusing it explains why it is inert.
 * The chip must carry `aria-disabled` rather than `disabled`: a disabled button
 * emits no pointer events and leaves the tab order, so neither trigger fires.
 */
export const SuggestionTooltip: React.FC< SuggestionTooltipProps > = ( {
	label,
	descriptionId,
	children,
} ) => {
	const [ portalTarget, setPortalTarget ] = React.useState< HTMLElement | null >( null );

	// Nearest `.agenttic` ancestor inherits the theme CSS vars while escaping the
	// chat's overflow clipping. Falls back to the local node when a consumer uses
	// `Suggestions` without that wrapper.
	const setContainerNode = React.useCallback( ( node: HTMLElement | null ) => {
		setPortalTarget( node ? node.closest< HTMLElement >( '.agenttic' ) ?? node : null );
	}, [] );

	return (
		<Tooltip.Provider delayDuration={ 200 }>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<span ref={ setContainerNode } className={ styles.trigger }>
						{ children }
					</span>
				</Tooltip.Trigger>
				<span id={ descriptionId } className={ styles.description }>
					{ label }
				</span>
				{ portalTarget && (
					<Tooltip.Portal container={ portalTarget }>
						<Tooltip.Content className={ styles.content } side="top" sideOffset={ 6 }>
							{ label }
						</Tooltip.Content>
					</Tooltip.Portal>
				) }
			</Tooltip.Root>
		</Tooltip.Provider>
	);
};
