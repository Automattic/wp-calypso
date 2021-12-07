import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import './style.scss';

const PluginDetailsHeader = ( { plugin, isPlaceholder } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const tags = Object.values( plugin?.tags || {} )
		.slice( 0, 3 )
		.join( ' · ' );

	if ( isPlaceholder ) {
		return <PluginDetailsHeaderPlaceholder />;
	}

	return (
		<>
			<div className="plugin-details-header__tags">{ tags }</div>
			<div className="plugin-details-header__container">
				<div className="plugin-details-header__name">{ plugin.name }</div>
				<div className="plugin-details-header__description">
					{ plugin.short_description || plugin.description }
				</div>
				<div className="plugin-details-header__additional-info">
					<div className="plugin-details-header__info">
						<div className="plugin-details-header__info-title">{ translate( 'Developer' ) }</div>
						<div className="plugin-details-header__info-value">
							<a href={ plugin.author_url }>{ plugin.author_name }</a>
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
		</>
	);
};

const PluginDetailsHeaderPlaceholder = () => {
	return (
		<div className="plugin-details-header-wrapper is-placeholder">
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
