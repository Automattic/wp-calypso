import { Badge } from '@automattic/components';
import { formatNumberCompact } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Rating from 'calypso/components/rating';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { preventWidows } from 'calypso/lib/formatting';
import { useIsMarketplaceRedesignEnabled } from 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { useLocalizedPlugins, formatPluginRating } from 'calypso/my-sites/plugins/utils';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import usePluginVersionInfo from '../plugin-management-v2/hooks/use-plugin-version-info';

import './style.scss';

const PluginDetailsHeader = ( { plugin, isPlaceholder, isJetpackCloud, isMarketplaceProduct } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const { localizePath } = useLocalizedPlugins();
	const isMarketplaceRedesignEnabled = useIsMarketplaceRedesignEnabled();

	const selectedSite = useSelector( getSelectedSite );

	const { currentVersionsRange } = usePluginVersionInfo( plugin, selectedSite?.ID );

	// Rating can be a valid number, 0 or null, discard undefined for easier comparison.
	// Marketplace products carry their WooCommerce.com rating, and only show it when there is one.
	const rating = isMarketplaceProduct ? plugin.rating || null : ( plugin.rating ?? null );

	if ( isPlaceholder ) {
		return <PluginDetailsHeaderPlaceholder />;
	}

	const getPluginReviewsLink = () => {
		if ( plugin.num_ratings > 0 ) {
			return null;
		}

		const onClickPluginRatingsLink = () => {
			gaRecordEvent( 'Plugins', 'Clicked Add a review link', 'Plugin Name', plugin.slug );
		};

		return (
			<a
				href={ `https://wordpress.org/support/plugin/${ plugin.slug }/reviews` }
				onClick={ onClickPluginRatingsLink }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Add a review' ) }
			</a>
		);
	};

	// Determine version display: marketplace products use plugin.version, others use installed versions
	const versionDisplay = isMarketplaceProduct
		? plugin.version
		: `${ currentVersionsRange?.min || plugin.version }${
				currentVersionsRange?.max ? ` - ${ currentVersionsRange.max }` : ''
			}`;

	return (
		<div className="plugin-details-header__container">
			<div className="plugin-details-header__main-info">
				<PluginIcon
					className="plugin-details-header__icon"
					image={ plugin.icon }
					size={ isMarketplaceRedesignEnabled ? 80 : undefined }
				/>
				<div className="plugin-details-header__title-container">
					<h1 className="plugin-details-header__name">{ plugin.name }</h1>
					<div className="plugin-details-header__subtitle">
						<span className="plugin-details-header__author">
							{ isJetpackCloud
								? plugin.author_name
								: translate( 'By {{author/}}', {
										components: {
											author: (
												<a
													href={ localizePath(
														`/plugins/${ selectedSite?.slug || '' }?s=developer:"${ getPluginAuthor(
															plugin
														) }"`
													) }
												>
													{ plugin.author_name }
												</a>
											),
										},
									} ) }
						</span>

						<span className="plugin-details-header__subtitle-separator">·</span>
					</div>
				</div>
			</div>
			<div className="plugin-details-header__description">
				{ preventWidows( plugin.short_description || plugin.description ) }
			</div>
			{ ! isJetpackCloud && <Tags plugin={ plugin } /> }
			<div className="plugin-details-header__additional-info">
				{ /* We want to accept rating 0, which means the plugin has no ratings yet */ }
				{ rating !== null && (
					<div className="plugin-details-header__info">
						<div className="plugin-details-header__info-title">
							{ isMarketplaceRedesignEnabled ? translate( 'Ratings' ) : translate( 'Rating' ) }
						</div>
						<div className="plugin-details-header__info-value">
							{ rating !== 0 &&
								( isMarketplaceRedesignEnabled ? (
									<div className="plugin-details-header__rating">
										<Rating rating={ rating } size={ 20 } />
										<span>{ formatPluginRating( rating, true ) }</span>
									</div>
								) : (
									<div>{ `${ formatPluginRating( rating, true ) }/5` }</div>
								) ) }
							{ ! isMarketplaceProduct && getPluginReviewsLink() }
						</div>
					</div>
				) }
				<div className="plugin-details-header__info is-version">
					<div className="plugin-details-header__info-title">{ translate( 'Version' ) }</div>
					<div className="plugin-details-header__info-value">{ versionDisplay }</div>
				</div>
				{ Boolean( plugin.active_installs ) && (
					<div className="plugin-details-header__info is-installs">
						<div className="plugin-details-header__info-title">
							{ translate( 'Active installations' ) }
						</div>
						<div className="plugin-details-header__info-value">
							{ formatNumberCompact( plugin.active_installs ) }
						</div>
					</div>
				) }
				<div className="plugin-details-header__info is-updated">
					<div className="plugin-details-header__info-title">{ translate( 'Last updated' ) }</div>
					<div className="plugin-details-header__info-value">
						{ moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).format( 'MMM D, YYYY' ) }
					</div>
				</div>
			</div>
		</div>
	);
};

const LIMIT_OF_TAGS = 3;
function Tags( { plugin } ) {
	const selectedSite = useSelector( getSelectedSite );
	const { localizePath } = useLocalizedPlugins();

	if ( ! plugin?.tags ) {
		return null;
	}

	const tagKeys = Object.keys( plugin.tags || {} ).slice( 0, LIMIT_OF_TAGS );

	return (
		<div className="plugin-details-header__tag-badge-container">
			{ tagKeys.map( ( tagKey ) => (
				<a
					key={ `badge-${ tagKey.replace( ' ', '' ) }` }
					className="plugin-details-header__tag-badge"
					href={ localizePath( `/plugins/browse/${ tagKey }/${ selectedSite?.slug || '' }` ) }
				>
					<Badge type="info">{ plugin.tags[ tagKey ] }</Badge>
				</a>
			) ) }
		</div>
	);
}

function PluginDetailsHeaderPlaceholder() {
	return (
		<div className="plugin-details-header__wrapper is-placeholder">
			<div className="plugin-details-header__tags">...</div>
			<div className="plugin-details-header__container">
				<h1 className="plugin-details-header__name">...</h1>
				<div className="plugin-details-header__description">...</div>
				<div className="plugin-details-header__additional-info">...</div>
			</div>
		</div>
	);
}

function getPluginAuthor( plugin ) {
	return plugin.author_name;
}

export default PluginDetailsHeader;
