import { getUrlParts } from '@automattic/calypso-url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getBoostRating, getBoostRatingClass } from '../../lib/boost';
import { Site } from '../../types';

interface Props {
	site: Site;
}

export default function SiteBoostColumn( { site }: Props ) {
	const translate = useTranslate();

	const overallScore = site.jetpack_boost_scores?.overall;
	const hasBoost = site.has_boost;
	const adminUrl = useSelector( ( state ) => getJetpackAdminUrl( state, site.blog_id ) );

	const handleGetBoostScoreAction = () => {
		// TODO - should open a modal.
	};

	if ( overallScore ) {
		return (
			<div
				className={ classNames(
					'sites-overview__boost-score',
					getBoostRatingClass( overallScore )
				) }
			>
				{ getBoostRating( overallScore ) }
			</div>
		);
	}

	if ( hasBoost ) {
		const { origin, pathname } = getUrlParts( adminUrl ?? '' );
		return (
			<a
				className="sites-overview__column-action-button is-link"
				href={
					adminUrl
						? `${ origin }${ pathname }?page=my-jetpack#/add-boost`
						: `https://${ site.url }/wp-admin/admin.php?page=jetpack`
				}
				target="_blank"
				rel="noreferrer"
			>
				{ translate( 'Configure Boost' ) }
			</a>
		);
	}

	return (
		<>
			<button
				className="sites-overview__column-action-button is-link"
				onClick={ handleGetBoostScoreAction }
			>
				{ translate( 'Get Score' ) }
			</button>
		</>
	);
}
