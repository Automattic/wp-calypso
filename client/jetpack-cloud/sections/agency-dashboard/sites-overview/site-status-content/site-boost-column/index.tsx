import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useContext, useState } from 'react';
import { useSelector } from 'calypso/state';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../../hooks';
import DashboardDataContext from '../../dashboard-data-context';
import { getBoostRating, getBoostRatingClass } from '../../lib/boost';
import BoostLicenseInfoModal from './boost-license-info-modal';
import type { Site } from '../../types';

interface Props {
	site: Site;
}

export default function SiteBoostColumn( { site }: Props ) {
	const translate = useTranslate();

	const { isLargeScreen } = useContext( DashboardDataContext );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );

	const overallScore = site.jetpack_boost_scores?.overall;
	const hasBoost = site.has_boost;
	const adminUrl = useSelector( ( state ) => getJetpackAdminUrl( state, site.blog_id ) );

	const [ showBoostModal, setShowBoostModal ] = useState( false );

	const handleGetBoostScoreAction = () => {
		setShowBoostModal( true );
		recordEvent( 'boost_column_get_score_click' );
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
				onClick={ () =>
					recordEvent( 'boost_column_score_click', {
						score: overallScore,
					} )
				}
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
				onClick={ () => recordEvent( 'boost_column_configure_click' ) }
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
