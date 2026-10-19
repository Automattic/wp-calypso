import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import illustrationUrl from './illustration.webp';
import type { ReactNode } from 'react';

import './style.scss';

/**
 * The shared layout of the DIFM offer modals: a panel on the left, and a main column with
 * an optional header item, a close button and the content. The panel shows the
 * illustration, or the `panel` content over the illustration background.
 */
export function DifmOfferModalFrame( {
	className,
	labelledBy,
	isBusy = false,
	headerStart,
	panel,
	onRequestClose,
	children,
}: {
	className?: string;
	labelledBy: string;
	isBusy?: boolean;
	headerStart?: ReactNode;
	panel?: ReactNode;
	onRequestClose: () => void;
	children: ReactNode;
} ) {
	return (
		<Modal
			className={ clsx( 'difm-offer-modal', className ) }
			__experimentalHideHeader
			aria={ { labelledby: labelledBy } }
			onRequestClose={ onRequestClose }
			isDismissible={ ! isBusy }
			shouldCloseOnEsc={ ! isBusy }
			shouldCloseOnClickOutside={ ! isBusy }
			size="large"
		>
			<div className="difm-offer-modal__layout">
				{ panel ? (
					<div className="difm-offer-modal__panel">{ panel }</div>
				) : (
					<img className="difm-offer-modal__illustration" src={ illustrationUrl } alt="" />
				) }
				<div className="difm-offer-modal__main">
					<div className="difm-offer-modal__header">
						{ headerStart ?? <span /> }
						{ ! isBusy && (
							<Button
								icon={ close }
								label={ __( 'Close' ) }
								size="compact"
								onClick={ onRequestClose }
							/>
						) }
					</div>
					{ children }
				</div>
			</div>
		</Modal>
	);
}

/**
 * Two segments, one per step of the offer modal.
 */
export function DifmOfferProgress( { step }: { step: 1 | 2 } ) {
	return (
		<div className="difm-offer-modal__progress" aria-hidden="true">
			<div className="difm-offer-modal__progress-bar" style={ { width: `${ step * 50 }%` } } />
		</div>
	);
}
