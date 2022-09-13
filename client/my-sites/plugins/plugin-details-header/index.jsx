import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import { preventWidows } from 'calypso/lib/formatting';
import { getPluginAuthorKeyword } from 'calypso/lib/plugins/utils';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const PluginDetailsHeader = ( { plugin, isPlaceholder, isJetpackCloud } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const { localizePath } = useLocalizedPlugins();

	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	const selectedSite = useSelector( getSelectedSite );

	if ( isPlaceholder ) {
		return <PluginDetailsHeaderPlaceholder />;
	}

	if ( legacyVersion || isJetpackCloud ) {
		return <LegacyPluginDetailsHeader plugin={ plugin } isJetpackCloud={ isJetpackCloud } />;
	}

	return (
		<div className="plugin-details-header__container">
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

function LegacyPluginDetailsHeader( { plugin, isJetpackCloud } ) {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const { localizePath } = useLocalizedPlugins();

	const selectedSite = useSelector( getSelectedSite );

	const tags = Object.values( plugin?.tags || {} )
		.slice( 0, 3 )
		.join( ' · ' );

	return (
		<div className="plugin-details-header__container">
			{ ! isJetpackCloud && <div className="plugin-details-header__tags">{ tags }</div> }
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
						{ isJetpackCloud ? (
							plugin.author_name
						) : (
							<a
								href={ localizePath(
									`/plugins/${ selectedSite?.slug || '' }?s=developer:"${ getPluginAuthor(
										plugin
									) }"`
								) }
							>
								{ plugin.author_name }
							</a>
						) }
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
}

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
				<div className="plugin-details-header__name">...</div>
				<div className="plugin-details-header__description">...</div>
				<div className="plugin-details-header__additional-info">...</div>
			</div>
		</div>
	);
}

function getPluginAuthor( plugin ) {
	if ( config.isEnabled( 'marketplace-jetpack-plugin-search' ) ) return plugin.author_name;

	return getPluginAuthorKeyword( plugin );
}

export default PluginDetailsHeader;
