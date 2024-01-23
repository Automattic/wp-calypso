import { Badge, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useMarketplaceReviewsQuery } from 'calypso/data/marketplace/use-marketplace-reviews';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import { preventWidows } from 'calypso/lib/formatting';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import usePluginVersionInfo from '../plugin-management-v2/hooks/use-plugin-version-info';

import './style.scss';

const PluginDetailsHeader = ( {
	plugin,
	isPlaceholder,
	isJetpackCloud,
	onReviewsClick = () => {},
} ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const { localizePath } = useLocalizedPlugins();

	const selectedSite = useSelector( getSelectedSite );

	const { currentVersionsRange } = usePluginVersionInfo( plugin, selectedSite?.ID );

	const { data: marketplaceReviews } = useMarketplaceReviewsQuery( {
		productType: 'plugin',
		slug: plugin.slug,
	} );
	const numberOfReviews = marketplaceReviews?.length || 0;

	if ( isPlaceholder ) {
		return <PluginDetailsHeaderPlaceholder />;
	}

	return (
		<div className="plugin-details-header__container">
			<div className="plugin-details-header__main-info">
				<PluginIcon className="plugin-details-header__icon" image={ plugin.icon } />
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

						{ ! isJetpackCloud && <Tags plugin={ plugin } /> }
					</div>
				</div>
			</div>
			<div className="plugin-details-header__description">
				{ preventWidows( plugin.short_description || plugin.description ) }
			</div>
			<div className="plugin-details-header__additional-info">
				{ !! plugin.rating && (
					<div className="plugin-details-header__info">
						<div className="plugin-details-header__info-title">{ translate( 'Ratings' ) }</div>
						<div className="plugin-details-header__info-value">
							<PluginRatings rating={ plugin.rating } />
							{ numberOfReviews > 0 && (
								<Button
									borderless
									className="plugin-details-header__number-reviews-link is-link"
									onClick={ onReviewsClick }
								>
									{ translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
										count: numberOfReviews,
										args: {
											numberOfReviews,
										},
									} ) }
								</Button>
							) }
						</div>
					</div>
				) }
				<div className="plugin-details-header__info">
					<div className="plugin-details-header__info-title">{ translate( 'Last updated' ) }</div>
					<div className="plugin-details-header__info-value">
						{ moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).format( 'LL' ) }
					</div>
				</div>
				<div className="plugin-details-header__info">
					<div className="plugin-details-header__info-title">{ translate( 'Version' ) }</div>
					<div className="plugin-details-header__info-value">
						{ /* Show the default version if plugin is not installed */ }
						{ currentVersionsRange?.min || plugin.version }
						{ currentVersionsRange?.max && ` - ${ currentVersionsRange.max }` }
					</div>
				</div>
				{ Boolean( plugin.active_installs ) && (
					<div className="plugin-details-header__info">
						<div className="plugin-details-header__info-title">
							{ translate( 'Active installations' ) }
						</div>
						<div className="plugin-details-header__info-value">
							{ formatNumberMetric( plugin.active_installs, 0 ) }
						</div>
					</div>
				) }
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
		<span className="plugin-details-header__tag-badge-container">
			{ tagKeys.map( ( tagKey ) => (
				<a
					key={ `badge-${ tagKey.replace( ' ', '' ) }` }
					className="plugin-details-header__tag-badge"
					href={ localizePath( `/plugins/browse/${ tagKey }/${ selectedSite?.slug || '' }` ) }
				>
					<Badge type="info">{ plugin.tags[ tagKey ] }</Badge>
				</a>
			) ) }
		</span>
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
