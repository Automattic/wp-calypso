import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import styles from './AgentUIInputToolbar.module.css';

export interface AgentUIInputToolbarProps {
	children?: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
	label?: string;
	disabled?: boolean;
}

export function AgentUIInputToolbar( {
	children,
	className,
	icon,
	label,
	disabled,
}: AgentUIInputToolbarProps = {} ) {
	const [ open, setOpen ] = React.useState( false );
	const toolbarLabel = label ?? 'Input Toolbar';

	return (
		<div className={ className }>
			<div className={ styles.container }>
				<Popover.Root open={ open } onOpenChange={ setOpen }>
					<Popover.Trigger asChild>
						<button
							type="button"
							className={ styles.button }
							aria-label={ toolbarLabel }
							disabled={ disabled }
						>
							{ icon }
							<span>{ toolbarLabel }</span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
								className={ `${ styles.icon } ${
									open ? styles.iconOpen : ''
								}` }
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M18.0045 10.5549L12 16.0136L5.9955 10.5549L7.00451 9.44504L12 13.9864L16.9955 9.44504L18.0045 10.5549Z"
									fill="currentColor"
								/>
							</svg>
						</button>
					</Popover.Trigger>
					<Popover.Content
						className={ styles.dropdown }
						side="bottom"
						align="start"
						sideOffset={ 8 }
						collisionPadding={ 8 }
						aria-label={ toolbarLabel }
					>
						{ children }
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	);
}
