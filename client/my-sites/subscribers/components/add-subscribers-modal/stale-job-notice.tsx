import { Gridicon } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useSubscriberImportStatusReset } from '../../mutations';

const LearnMoreLink = ( { isJetpack }: { isJetpack: boolean | null } ) => {
	const translate = useTranslate();
	const learnMoreText = translate( 'Learn more' );

	return (
		<>
			{ isJetpack ? (
				<ExternalLink
					href={ localizeUrl( 'https://jetpack.com/support/newsletter/import-subscribers/' ) }
				>
					{ learnMoreText }
				</ExternalLink>
			) : (
				<InlineSupportLink
					showIcon={ false }
					supportLink={ localizeUrl(
						'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/'
					) }
					supportPostId={ 220199 }
				>
					{ learnMoreText }
				</InlineSupportLink>
			) }
		</>
	);
};

export const StaleImportJobsNotice = ( {
	isJetpack,
	siteId,
}: {
	isJetpack: boolean | null;
	siteId: number | null;
} ) => {
	const [ isCancelling, setIsCancelling ] = useState( false );
	const translate = useTranslate();
	const imports =
		useSelect( ( select ) => select( Subscriber.store ).getImportJobsSelector(), [] ) || [];
	const lastImportWasCancelled = imports[ 1 ]?.status === 'cancelled';
	const { mutate: resetImportStatus } = useSubscriberImportStatusReset( siteId );

	return (
		<Notice
			className="add-subscribers-modal__notice"
			icon={ <Gridicon icon="notice" /> }
			isCompact
			theme="light"
			status="is-warning"
			showDismiss={ false }
		>
			{ lastImportWasCancelled ? (
				<>
					<span className="add-subscribers-modal__notice-text">
						{ translate(
							'Your recent import is taking longer than expected to complete. If this issue persists, please contact our support team for assistance.'
						) }
					</span>
					<LearnMoreLink isJetpack={ isJetpack } />
				</>
			) : (
				<>
					<span className="add-subscribers-modal__notice-text">
						{ translate(
							'Your recent import is taking longer than expected to complete. Please cancel your import and try again.'
						) }
					</span>
					<NoticeAction
						onClick={ () => {
							setIsCancelling( true );
							resetImportStatus();
						} }
					>
						{ isCancelling ? translate( 'Cancelling import…' ) : translate( 'Cancel import' ) }
					</NoticeAction>
				</>
			) }
		</Notice>
	);
};
