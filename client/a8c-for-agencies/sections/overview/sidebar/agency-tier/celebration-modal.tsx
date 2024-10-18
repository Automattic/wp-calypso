import { Button } from '@wordpress/components';
import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { AgencyTierInfo } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

// Style is imported from the parent component

const PREFERENCE_NAME = 'a4a-agency-tier-celebration-modal-dismissed-type';

export default function AgencyTierCelebrationModal( {
	agencyTierInfo,
	currentAgencyTier,
}: {
	agencyTierInfo?: AgencyTierInfo | null;
	currentAgencyTier?: string | null;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ videoWidth, setVideoWidth ] = useState( 0 );

	const celebrationModalShowForCurrentType = useSelector( ( state ) =>
		getPreference( state, PREFERENCE_NAME )
	);

	useLayoutEffect( () => {
		const content = document.getElementsByClassName( 'a4a-themed-modal__content' )[ 0 ];
		if ( content ) {
			// Add 20px to the clientHeight to avoid the video being cut
			const clientHeight = content.clientHeight + 20;
			setVideoWidth( clientHeight );
		}
	}, [] );

	if ( ! agencyTierInfo || celebrationModalShowForCurrentType === currentAgencyTier ) {
		return null;
	}

	const handleOnClose = () => {
		dispatch( savePreference( PREFERENCE_NAME, currentAgencyTier ?? '' ) );
	};

	const { title, description, extraDescription, benefits, video } = agencyTierInfo.celebrationModal;

	return (
		<A4AThemedModal
			className={ clsx( 'agency-tier-celebration-modal', currentAgencyTier ) }
			modalVideo={ <video src={ video } preload="auto" width={ videoWidth } loop muted autoPlay /> }
			onClose={ handleOnClose }
			dismissable
		>
			<div className="agency-tier-celebration-modal__content">
				<div className="agency-tier-celebration-modal__title">{ title }</div>
				<div className="agency-tier-celebration-modal__description">{ description }</div>
				{ extraDescription && (
					<div className="agency-tier-celebration-modal__extra-description">
						{ extraDescription }
					</div>
				) }
				<ul className="agency-tier-celebration-modal__benefits">
					{ benefits.map( ( benefit ) => (
						<li key={ benefit }>{ benefit }</li>
					) ) }
				</ul>
				<Button variant="primary" href={ A4A_AGENCY_TIER_LINK }>
					{ translate( 'Explore your benefits' ) }
				</Button>
			</div>
		</A4AThemedModal>
	);
}
