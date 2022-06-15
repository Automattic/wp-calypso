import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import { preventWidows } from 'calypso/lib/formatting';
import { getPluginAuthorKeyword } from 'calypso/lib/plugins/utils';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const PluginDetailsHeader = ( { plugin, isPlaceholder } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	const selectedSite = useSelector( getSelectedSite );
	const banner = plugin.banners?.high || plugin.banners?.low;

	if ( isPlaceholder ) {
		return <PluginDetailsHeaderPlaceholder />;
	}

	if ( legacyVersion ) {
		return <LegacyPluginDetailsHeader plugin={ plugin } />;
	}

	return (
		<div className="plugin-details-header__container">
			{ Boolean( banner ) && (
				<div className="plugin-details-header__banner">
					<img className="plugin-details-header__banner-image" alt={ plugin.name } src={ banner } />
				</div>
			) }
			<div className="plugin-details-header__main-info">
				<img className="plugin-details-header__icon" src={ plugin.icon } alt="" />
				<div className="plugin-details-header__title-container">
					<div className="plugin-details-header__name">{ plugin.name }</div>
					<div className="plugin-details-header__subtitle">
						<span className="plugin-details-header__author">
							{ translate( 'By {{author/}}', {
								components: {
									author: (
										<a
											href={ `/plugins/${
												selectedSite?.slug || ''
											}?s=developer:"${ getPluginAuthorKeyword( plugin ) }"` }
										>
											{ plugin.author_name }
										</a>
									),
								},
							} ) }
						</span>

						<span className="plugin-details-header__subtitle-separator">·</span>

						<Tags plugin={ plugin } />
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
					<div className="plugin-details-header__info-value">{ plugin.version }</div>
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

const LegacyPluginDetailsHeader = ( { plugin } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );

	const tags = Object.values( plugin?.tags || {} )
		.slice( 0, 3 )
		.join( ' · ' );

	return (
		<div className="plugin-details-header__container">
			<div className="plugin-details-header__tags">{ tags }</div>
			<div className="plugin-details-header__main-info">
				<img className="plugin-details-header__icon" src={ plugin.icon } alt="" />
				<div className="plugin-details-header__title-container">
					<div className="plugin-details-header__name">{ plugin.name }</div>
					<div className="plugin-details-header__description">
						{ preventWidows( plugin.short_description || plugin.description ) }
					</div>
				</div>
			</div>
			<div className="plugin-details-header__additional-info">
				<div className="plugin-details-header__info">
					<div className="plugin-details-header__info-title">{ translate( 'Developer' ) }</div>
					<div className="plugin-details-header__info-value">
						<a
							href={ `/plugins/${ selectedSite?.slug || '' }?s=developer:"${ getPluginAuthorKeyword(
								plugin
							) }"` }
						>
							{ plugin.author_name }
						</a>
					</div>
				</div>
				{ !! plugin.rating && (
					<div className="plugin-details-header__info">
						<div className="plugin-details-header__info-title">{ translate( 'Ratings' ) }</div>
						<div className="plugin-details-header__info-value">
							<PluginRatings rating={ plugin.rating } />
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
					<div className="plugin-details-header__info-value">{ plugin.version }</div>
				</div>
			</div>
		</div>
	);
};

const LIMIT_OF_TAGS = 3;
const Tags = ( { plugin } ) => {
	if ( ! plugin?.tags ) {
		return null;
	}

	const tags = Object.values( plugin.tags || {} ).slice( 0, LIMIT_OF_TAGS );

	return (
		<span>
			{ tags.map( ( tag ) => (
				<Badge
					key={ `badge-${ tag.replace( ' ', '' ) }` }
					type="info"
					className="plugin-details-header__tag-badge"
				>
					{ tag }
				</Badge>
			) ) }
		</span>
	);
};

const PluginDetailsHeaderPlaceholder = () => {
	return (
		<div className="plugin-details-header__wrapper is-placeholder">
			<div className="plugin-details-header__tags">...</div>
			<div className="plugin-details-header__container">
				<div className="plugin-details-header__name">...</div>
				<div className="plugin-details-header__description">...</div>
				<div className="plugin-details-header__additional-info">...</div>
			</div>
		</div>
	);
};

export default PluginDetailsHeader;
