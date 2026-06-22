import { useTranslate } from 'i18n-calypso';

interface Props {
	failedCount: number;
	onRetry?: () => void;
}

/**
 * "One or more sources couldn't be loaded" banner for an aggregated space feed.
 * Built but intentionally un-wired in this POC — the per-source failure signal
 * arrives with the real data layer (deferred). Renders nothing while
 * `failedCount` is 0, so it's a no-op until something feeds it.
 */
export function SpaceFeedSourceNotice( { failedCount, onRetry }: Props ) {
	const translate = useTranslate();

	if ( failedCount <= 0 ) {
		return null;
	}

	return (
		<div className="space-feed__source-notice" role="status">
			<span>
				{ translate(
					'%(count)d source couldn’t be loaded.',
					'%(count)d sources couldn’t be loaded.',
					{ count: failedCount, args: { count: failedCount } }
				) }
			</span>
			{ onRetry && (
				<button type="button" className="space-feed__source-notice-retry" onClick={ onRetry }>
					{ translate( 'Retry' ) }
				</button>
			) }
		</div>
	);
}
