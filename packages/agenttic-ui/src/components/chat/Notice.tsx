import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { XIcon } from '../icons/XIcon';
import { AlertCircleIcon } from '../icons/AlertCircleIcon';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { cn } from '../../utils/classNames';
import styles from './Notice.module.css';
import Markdown from 'react-markdown';

interface NoticeProps {
	icon?: React.ReactNode | null | false;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	dismissible?: boolean;
	onDismiss?: () => void;
	className?: string;
	status?: 'success' | 'warning' | 'error';
}

export function Notice( {
	icon,
	message,
	action,
	dismissible = true,
	onDismiss,
	className,
	status,
}: NoticeProps ) {
	const getIcon = useCallback( () => {
		// If a custom icon is provided, use it
		if ( React.isValidElement( icon ) ) {
			return icon;
		}

		// If icon is explicitly set to false or null, do not render any icon
		if ( icon === false || icon === null ) {
			return null;
		}

		// Default icons based on status
		switch ( status ) {
			case 'warning':
				return <AlertCircleIcon />;
			case 'error':
				return <AlertTriangleIcon />;
			default:
				return null;
		}
	}, [ icon, status ] );

	const iconNode = getIcon();

	return (
		<div
			data-slot="notice"
			className={ cn(
				styles.container,
				{
					[ styles.isSuccess ]: status === 'success',
					[ styles.isWarning ]: status === 'warning',
					[ styles.isError ]: status === 'error',
				},
				className
			) }
		>
			<div className={ styles.content }>
				{ iconNode && (
					<div className={ styles.icon }>{ iconNode }</div>
				) }
				{ /* Add markdown support with select whitelisted tags */ }
				<div>
					<Markdown
						allowedElements={ [ 'p', 'strong', 'em', 'a', 'br' ] }
						unwrapDisallowed
						components={ {
							a: ( { node, ...props } ) => (
								<a
									{ ...props }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ props.children }
								</a>
							),
						} }
					>
						{ message }
					</Markdown>
				</div>
			</div>
			<div className={ styles.actions }>
				{ action && (
					<Button
						className={ styles.action }
						onClick={ action.onClick }
						variant="link"
					>
						{ action.label }
					</Button>
				) }
				{ dismissible && onDismiss && (
					<Button
						className={ styles.dismissible }
						onClick={ onDismiss }
						variant="ghost"
						size="sm"
						icon={ <XIcon /> }
					/>
				) }
			</div>
		</div>
	);
}
