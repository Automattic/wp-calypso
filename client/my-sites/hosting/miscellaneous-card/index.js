import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const MiscellaneousCard = ( {
	disabled,
	shouldRateLimitCacheClear,
	clearAtomicWordPressCache,
	isClearingCache,
	siteId,
	translate,
} ) => {
	const clearCache = () => {
		clearAtomicWordPressCache( siteId, 'Clearing again in less than 5 minutes.' );
	};

	const getClearCacheContent = () => {
		return (
			<div>
				<p>
					{ translate( '{{strong}}Warning!{{/strong}}', {
						components: {
							strong: <strong />,
						},
					} ) }
				</p>
				<p>
					{ translate(
						'Clearing the cache on your site may make it unresponsive while the cache is rebuilding. ' +
							'Please use this feature responsibly.'
					) }
				</p>
				<Button
					onClick={ clearCache }
					busy={ isClearingCache }
					disabled={ disabled || isClearingCache || shouldRateLimitCacheClear }
				>
					<span>{ translate( 'Clear Cache' ) }</span>
				</Button>
				{ shouldRateLimitCacheClear && (
					<p class="form-setting-explanation">
						{ translate(
							'You cleared the cache recently. Please wait a few minutes and try again.'
						) }
					</p>
				) }
			</div>
		);
	};

	return (
		<Card className="miscellaneous-card">
			<MaterialIcon icon="settings" size={ 32 } />
			<CardHeading>{ translate( 'Miscellaneous' ) }</CardHeading>
			{ getClearCacheContent() }
		</Card>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			shouldRateLimitCacheClear: shouldRateLimitAtomicCacheClear( state, siteId ),
			isClearingCache: getRequest( state, clearWordPressCache( siteId ) )?.isLoading ?? false,
			siteId,
		};
	},
	{
		clearAtomicWordPressCache: clearWordPressCache,
	}
)( localize( MiscellaneousCard ) );
