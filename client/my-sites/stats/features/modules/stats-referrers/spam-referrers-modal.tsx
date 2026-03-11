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
	const { data, isLoading } = useSpamReferrersQuery( siteId );
	const { mutate: unspamReferrer } = useUnspamReferrerMutation( siteId );
	const hasChangesRef = useRef( false );

	const handleUnspam = useCallback(
		( domain: string ) => {
			hasChangesRef.current = true;
			unspamReferrer( domain );
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
			{ isLoading && <p>{ translate( 'Loading…' ) }</p> }
			{ ! isLoading && domains.length === 0 && (
				<p className="spam-referrers-modal__empty">
					{ translate(
						'No spam referrers yet. To mark a referrer as spam, hover over it in the referrers list and click the warning icon. Spam referrers are hidden from future stats but historical data is not affected.'
					) }
				</p>
			) }
			{ ! isLoading && domains.length > 0 && (
				<ul className="spam-referrers-modal__list">
					{ domains.map( ( item ) => (
						<li key={ item.domain } className="spam-referrers-modal__item">
							<span className="spam-referrers-modal__domain">{ item.domain }</span>
							<Button variant="link" isDestructive onClick={ () => handleUnspam( item.domain ) }>
								{ translate( 'Remove' ) }
							</Button>
						</li>
					) ) }
				</ul>
			) }
		</Modal>
	);
};

export default SpamReferrersModal;
