import { Button, Popover } from '@automattic/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { HELP_CENTER_STORE } from '../stores';

interface Props {
	newItems: boolean;
}

const HelpIcon = ( { newItems }: Props ) => {
	const { unreadCount, hasSeenPromotion, doneLoading } = useSelect(
		( select ) => ( {
			unreadCount: select( HELP_CENTER_STORE ).getUnreadCount(),
			hasSeenPromotion: select( HELP_CENTER_STORE ).getHasSeenPromotionalPopover(),
			doneLoading: select( 'core/data' ).hasFinishedResolution(
				HELP_CENTER_STORE,
				'getHasSeenPromotionalPopover',
				[]
			),
		} ),
		[]
	);
	const { setHasSeenPromotionalPopover } = useDispatch( HELP_CENTER_STORE );
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { __ } = useI18n();
	const [ ref, setRef ] = useState< SVGSVGElement | null >( null );

	return (
		<>
			<svg
				ref={ ( newRef ) => newRef !== ref && setRef( newRef ) }
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{ newItems || unreadCount > 0 ? (
					<>
						<path d="M 12.75 15.5 L 12.75 17 L 11.25 17 L 11.25 15.5 Z M 9 10.75 C 9.033 9.975 9.377 9.13 9.879 8.629 C 10.38 8.127 11.225 7.75 12 7.75 C 12.775 7.75 13.62 8.127 14.121 8.629 C 14.623 9.13 15 9.975 15 10.75 C 15 11.473 14.672 12.266 14.229 12.758 C 13.873 13.154 13.317 13.474 12.75 13.639 L 12.75 14.5 L 11.25 14.5 L 11.25 13.25 C 11.283 13.026 11.401 12.688 11.534 12.551 C 11.666 12.415 11.971 12.286 12.167 12.241 C 12.593 12.221 12.84 12.059 13.115 11.754 C 13.39 11.448 13.5 11.186 13.5 10.75 C 13.5 10.282 13.373 10.002 13.061 9.689 C 12.748 9.377 12.468 9.25 12 9.25 C 11.532 9.25 11.252 9.377 10.939 9.689 C 10.627 10.002 10.467 10.282 10.5 10.75 Z M 18.187 18.687 C 16.645 20.229 14.362 21.25 12 21.25 C 9.638 21.25 7.355 20.229 5.813 18.687 C 4.271 17.145 3.25 14.862 3.25 12.5 C 3.25 10.138 4.271 7.855 5.813 6.313 C 7.355 4.771 9.638 3.75 12 3.75 C 13.466 3.75 14.902 4.143 16.149 4.811 C 15.836 5.188 15.578 5.612 15.386 6.071 C 14.388 5.538 13.257 5.25 12 5.25 C 9.944 5.25 8.227 6.02 6.873 7.373 C 5.52 8.727 4.75 10.444 4.75 12.5 C 4.75 14.556 5.52 16.273 6.873 17.627 C 8.227 18.98 9.944 19.75 12 19.75 C 14.056 19.75 15.773 18.98 17.127 17.627 C 18.382 16.371 19.135 14.803 19.238 12.942 C 19.486 12.98 19.741 13 20 13 C 20.251 13 20.497 12.982 20.738 12.946 C 20.619 15.147 19.632 17.242 18.187 18.687 Z" />
						<circle cx="20" cy="8" r="4" fill="var( --color-masterbar-unread-dot-background )" />
					</>
				) : (
					<path d="M 12.75 15.5 L 12.75 17 L 11.25 17 L 11.25 15.5 Z M 9 10.75 C 9.033 9.975 9.377 9.13 9.879 8.629 C 10.38 8.127 11.225 7.75 12 7.75 C 12.775 7.75 13.62 8.127 14.121 8.629 C 14.623 9.13 15 9.975 15 10.75 C 15 11.473 14.672 12.266 14.229 12.758 C 13.873 13.154 13.317 13.474 12.75 13.639 L 12.75 14.5 L 11.25 14.5 L 11.25 13.25 C 11.283 13.026 11.401 12.688 11.534 12.551 C 11.666 12.415 11.971 12.286 12.167 12.241 C 12.593 12.221 12.84 12.059 13.115 11.754 C 13.39 11.448 13.5 11.186 13.5 10.75 C 13.5 10.282 13.373 10.002 13.061 9.689 C 12.748 9.377 12.468 9.25 12 9.25 C 11.532 9.25 11.252 9.377 10.939 9.689 C 10.627 10.002 10.467 10.282 10.5 10.75 Z M 20.75 12.5 C 20.75 14.862 19.729 17.145 18.187 18.687 C 16.645 20.229 14.362 21.25 12 21.25 C 9.638 21.25 7.355 20.229 5.813 18.687 C 4.271 17.145 3.25 14.862 3.25 12.5 C 3.25 10.138 4.271 7.855 5.813 6.313 C 7.355 4.771 9.638 3.75 12 3.75 C 14.362 3.75 16.645 4.771 18.187 6.313 C 19.729 7.855 20.75 10.138 20.75 12.5 Z M 17.127 7.373 C 15.773 6.02 14.056 5.25 12 5.25 C 9.944 5.25 8.227 6.02 6.873 7.373 C 5.52 8.727 4.75 10.444 4.75 12.5 C 4.75 14.556 5.52 16.273 6.873 17.627 C 8.227 18.98 9.944 19.75 12 19.75 C 14.056 19.75 15.773 18.98 17.127 17.627 C 18.48 16.273 19.25 14.556 19.25 12.5 C 19.25 10.444 18.48 8.727 17.127 7.373 Z" />
				) }
			</svg>

			<Popover
				className="help-center__promotion-popover"
				isVisible={ doneLoading && ! hasSeenPromotion && ! isDismissed }
				context={ ref }
				onClose={ () => {
					setIsDismissed( true );
					setHasSeenPromotionalPopover( true );
				} }
				position="bottom left"
				showDelay={ 500 }
			>
				<div className="help-center__promotion-popover-inner">
					<h1>{ __( '✨ Our new Help Center', __i18n_text_domain__ ) }</h1>
					<p>
						{ __(
							'We moved our help resources! You can always find it int he top bar.',
							__i18n_text_domain__
						) }
					</p>
					<div className="help-center__promotion-popover-actions">
						<Button
							onClick={ ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
								setIsDismissed( true );
								setHasSeenPromotionalPopover( true );
								event.stopPropagation();
							} }
						>
							{ __( 'Got it', __i18n_text_domain__ ) }
						</Button>
					</div>
				</div>
			</Popover>
		</>
	);
};

export default HelpIcon;
