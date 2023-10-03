import { getUrlParts } from '@automattic/calypso-url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getBoostRating, getBoostRatingClass } from '../../lib/boost';
import BoostLicenseInfoModal from './boost-license-info-modal';
import type { Site } from '../../types';

interface Props {
	site: Site;
}

export default function SiteBoostColumn( { site }: Props ) {
	const translate = useTranslate();

	const overallScore = site.jetpack_boost_scores?.overall;
	const hasBoost = site.has_boost;
	const adminUrl = useSelector( ( state ) => getJetpackAdminUrl( state, site.blog_id ) );

	const [ showBoostModal, setShowBoostModal ] = useState( false );

	const handleGetBoostScoreAction = () => {
		setShowBoostModal( true );
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
						? `${ origin }${ pathname }?page=jetpack-boost`
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
			{ showBoostModal && (
				<BoostLicenseInfoModal
					onClose={ () => setShowBoostModal( false ) }
					siteId={ site.blog_id }
					siteUrl={ site.url }
				/>
			) }
		</>
	);
}
