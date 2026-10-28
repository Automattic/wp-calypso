import * as RadixTooltip from '@radix-ui/react-tooltip';
import * as React from 'react';
import styles from './tooltip.module.css';

export interface TooltipProps {
	label: string;
	/**
	 * When set, a hidden copy of `label` is rendered with this id so the control
	 * inside can point its `aria-describedby` at it and be described even while
	 * the tooltip is closed. Radix only describes the trigger element, and only
	 * while open. Useful for an inert control explaining why it is inert; such a
	 * control must carry `aria-disabled` rather than `disabled`, since a disabled
	 * button emits no pointer events and leaves the tab order.
	 */
	descriptionId?: string;
	children: React.ReactNode;
}

export const Tooltip: React.FC< TooltipProps > = ( { label, descriptionId, children } ) => {
	const [ portalTarget, setPortalTarget ] = React.useState< HTMLElement | null >( null );

	// Nearest `.agenttic` ancestor inherits the theme CSS vars while escaping the
	// chat's overflow clipping. Falls back to the local node when rendered
	// without that wrapper.
	const setContainerNode = React.useCallback( ( node: HTMLElement | null ) => {
		setPortalTarget( node ? ( node.closest< HTMLElement >( '.agenttic' ) ?? node ) : null );
	}, [] );

	return (
		<RadixTooltip.Provider delayDuration={ 200 }>
			<RadixTooltip.Root>
				<RadixTooltip.Trigger asChild>
					<span ref={ setContainerNode } className={ styles.trigger }>
						{ children }
					</span>
				</RadixTooltip.Trigger>
				{ descriptionId && (
					<span id={ descriptionId } className={ styles.description }>
						{ label }
					</span>
				) }
				{ portalTarget && (
					<RadixTooltip.Portal container={ portalTarget }>
						<RadixTooltip.Content className={ styles.content } side="top" sideOffset={ 6 }>
							{ label }
						</RadixTooltip.Content>
					</RadixTooltip.Portal>
				) }
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	);
};
