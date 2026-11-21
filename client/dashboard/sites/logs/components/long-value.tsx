import { Button } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Popover } from '@wordpress/ui';
import { useState } from 'react';

import './style.scss';

/**
 * A log value kept on one line. When it does not fit, hovering, focusing or pressing
 * it opens a panel with the full value and a button to copy it.
 */
export function LongValue( { label, value }: { label: string; value: string } ) {
	const [ isTruncated, setIsTruncated ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( false );
	const textRef = useResizeObserver( ( [ entry ] ) => {
		setIsTruncated( entry.target.scrollWidth > entry.target.clientWidth );
	} );

	const copy = async () => {
		try {
			await navigator.clipboard.writeText( value );
			setIsCopied( true );
		} catch {
			setIsCopied( false );
		}
	};

	return (
		<Popover.Root onOpenChange={ ( open ) => ! open && setIsCopied( false ) }>
			<Popover.Trigger
				className="site-logs-long-value"
				disabled={ ! isTruncated }
				openOnHover
				delay={ 300 }
				closeDelay={ 150 }
			>
				<span ref={ textRef } className="site-logs-long-value__text">
					{ value }
				</span>
			</Popover.Trigger>
			<Popover.Popup
				className="site-logs-long-value__panel"
				positioner={
					<Popover.Positioner
						side="bottom"
						align="start"
						sideOffset={ 4 }
						collisionAvoidance={ { side: 'flip', align: 'shift', fallbackAxisSide: 'none' } }
					/>
				}
			>
				<div className="site-logs-long-value__header">
					<Popover.Title className="site-logs-long-value__title">{ label }</Popover.Title>
					<Button variant="secondary" size="compact" onClick={ copy }>
						{ isCopied ? __( 'Copied' ) : __( 'Copy' ) }
					</Button>
				</div>
				<div className="site-logs-long-value__full">{ value }</div>
			</Popover.Popup>
		</Popover.Root>
	);
}
