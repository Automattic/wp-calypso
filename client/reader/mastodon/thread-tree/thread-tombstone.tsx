import { Icon, info, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

interface MastodonThreadTombstoneProps {
	kind: 'not_found' | 'blocked';
}

export function MastodonThreadTombstone( { kind }: MastodonThreadTombstoneProps ) {
	const translate = useTranslate();
	const message =
		kind === 'not_found'
			? translate( 'Post unavailable' )
			: translate( 'Post is from a blocked author' );
	const icon = kind === 'not_found' ? info : lock;
	return (
		<div className="thread-tombstone" role="note">
			<Icon icon={ icon } size={ 16 } aria-hidden="true" />
			<span>{ message }</span>
		</div>
	);
}
