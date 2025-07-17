import React from 'react';
import { Button } from '../ui/button';
import { XIcon } from '../icons/XIcon';
import { cn } from '../../utils/classNames';
import styles from './Notice.module.css';

interface NoticeProps {
	icon?: React.ReactNode;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	dismissible?: boolean;
	onDismiss?: () => void;
}

export function Notice( {
	icon,
	message,
	action,
	dismissible = true,
	onDismiss,
}: NoticeProps ) {
	return (
		<div
			data-slot="notice"
			className={ cn( styles.container, {
				[ styles.containerWithIcon ]: !! icon,
			} ) }
		>
			<div className={ styles.content }>
				{ icon && <div className={ styles.icon }>{ icon }</div> }
				<span>{ message }</span>
			</div>
			<div className={ styles.actions }>
				{ action && (
					<Button onClick={ action.onClick } variant="link">
						{ action.label }
					</Button>
				) }
				{ dismissible && onDismiss && (
					<Button
						className={ styles.dismissible }
						onClick={ onDismiss }
						variant="tertiary"
						size="xxs"
						iconSize="sm"
						icon={ <XIcon strokeWidth={ 3 } /> }
					/>
				) }
			</div>
		</div>
	);
}
