import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
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

	const { origin, pathname } = getUrlParts( adminUrl ?? '' );

	const href = adminUrl
		? `${ origin }${ pathname }?page=jetpack-boost`
		: `https://${ site.url }/wp-admin/admin.php?page=jetpack`;

	if ( overallScore ) {
		return (
			<Button
				borderless
				className={ classNames(
					'sites-overview__boost-score',
					getBoostRatingClass( overallScore )
				) }
				href={ href }
				target="_blank"
			>
				{ getBoostRating( overallScore ) }
			</Button>
		);
	}

	if ( hasBoost ) {
		return (
			<a
				className="sites-overview__column-action-button is-link"
				href={ href }
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
				<BoostLicenseInfoModal onClose={ () => setShowBoostModal( false ) } site={ site } />
			) }
		</>
	);
}
