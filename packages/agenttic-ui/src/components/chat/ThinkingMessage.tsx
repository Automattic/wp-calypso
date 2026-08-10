import React, { memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { BigSkyIcon } from '../icons/BigSkyIcon';
import styles from './Thinking.module.css';

export interface ThinkingMessageProps {
	content?: string;
}

export const ThinkingMessage = memo(
	React.forwardRef< HTMLDivElement, ThinkingMessageProps >(
		function ThinkingMessage(
			{
				content = __( 'Thinking…', 'a8c-agenttic' ),
			}: ThinkingMessageProps,
			ref
		) {
			const displayIcon = useMemo( () => <BigSkyIcon />, [] );

			return (
				<div
					ref={ ref }
					data-slot="thinking"
					className={ styles.container }
				>
					<div className={ styles.icon }>{ displayIcon }</div>
					<span className={ styles.content }>{ content }</span>
				</div>
			);
		}
	)
);
