import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import getRequest from 'calypso/state/selectors/get-request';
import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const CacheCard = ( {
	disabled,
	shouldRateLimitCacheClear,
	clearAtomicWordPressCache,
	isClearingCache,
	siteId,
	translate,
} ) => {
	const clearCache = () => {
		clearAtomicWordPressCache( siteId, 'Manually clearing again.' );
	};

	const getClearCacheContent = () => {
		return (
			<div>
				<p>
					{ translate(
						'Be careful, clearing the cache may make your site unresponsive while it is being rebuilt. {{a}}Learn more about clearing your site’s cache{{/a}}',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
							},
						}
					) }
				</p>
				<Button
					primary
					onClick={ clearCache }
					busy={ isClearingCache }
					disabled={ disabled || isClearingCache || shouldRateLimitCacheClear }
				>
					<span>{ translate( 'Clear cache' ) }</span>
				</Button>
				{ shouldRateLimitCacheClear && (
					<p class="form-setting-explanation">
						{ translate( 'You cleared the cache recently. Please wait a minute and try again.' ) }
					</p>
				) }
			</div>
		);
	};
	//autorenew
	return (
		<Card className="cache-card">
			<MaterialIcon icon="autorenew" size={ 24 } />
			<CardHeading id="cache">{ translate( 'Cache' ) }</CardHeading>
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
)( localize( CacheCard ) );
