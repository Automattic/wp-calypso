import { NoticeBanner, Spinner } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useCallback } from 'react';
import useSpamReferrersQuery, {
	useUnspamReferrerMutation,
} from 'calypso/my-sites/stats/hooks/use-spam-referrers-query';

import './spam-referrers-modal.scss';

interface SpamReferrersModalProps {
	siteId: number;
	onClose: ( hasChanges: boolean ) => void;
}

const SpamReferrersModal: React.FC< SpamReferrersModalProps > = ( { siteId, onClose } ) => {
	const translate = useTranslate();
	const { data, isLoading, isError: isFetchError } = useSpamReferrersQuery( siteId );
	const { mutate: unspamReferrer, isError: isUnspamError } = useUnspamReferrerMutation( siteId );
	const hasChangesRef = useRef( false );
	const listRef = useRef< HTMLUListElement >( null );

	const handleUnspam = useCallback(
		( domain: string ) => {
			hasChangesRef.current = true;
			unspamReferrer( domain );
			// The optimistic update removes the focused button from the DOM,
			// which drops focus to document.body and breaks Escape-to-close.
			// Restore focus to the modal after the DOM update.
			requestAnimationFrame( () => {
				listRef.current?.closest< HTMLDivElement >( '.components-modal__frame' )?.focus();
			} );
		},
		[ unspamReferrer ]
	);

	const handleClose = useCallback( () => {
		onClose( hasChangesRef.current );
	}, [ onClose ] );

	const domains = data?.domains ?? [];

	return (
		<Modal
			title={ translate( 'Spam referrers' ) }
			onRequestClose={ handleClose }
			className="spam-referrers-modal"
		>
			{ isLoading && <Spinner /> }
			{ isFetchError && (
				<NoticeBanner level="error" hideCloseButton>
					{ translate(
						'Sorry, something went wrong loading spam referrers. Please try again later.'
					) }
				</NoticeBanner>
			) }
			{ ! isLoading && ! isFetchError && domains.length === 0 && (
				<div className="spam-referrers-modal__empty">
					<p>
						{ translate(
							'No spam referrers yet. To mark a referrer as spam, hover over it in the referrers list and click the warning icon.'
						) }
					</p>
					<p>
						{ translate(
							'Spam referrers are hidden from future stats but historical data is not affected.'
						) }
					</p>
				</div>
			) }
			{ ! isLoading && ! isFetchError && domains.length > 0 && (
				<>
					{ isUnspamError && (
						<NoticeBanner level="error" hideCloseButton>
							{ translate(
								'Sorry, something went wrong removing the spam referrer. Please try again.'
							) }
						</NoticeBanner>
					) }
					<p className="spam-referrers-modal__note">
						{ translate( 'Note: Changes may take a few minutes to appear in your stats.' ) }
					</p>
					<ul ref={ listRef } className="spam-referrers-modal__list">
						{ domains.map( ( item ) => (
							<li key={ item.domain } className="spam-referrers-modal__item">
								<span className="spam-referrers-modal__domain">{ item.domain }</span>
								<Button variant="link" isDestructive onClick={ () => handleUnspam( item.domain ) }>
									{ translate( 'Remove' ) }
								</Button>
							</li>
						) ) }
					</ul>
				</>
			) }
		</Modal>
	);
};

export default SpamReferrersModal;
