import { PLAN_JETPACK_COMPLETE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Button from 'calypso/components/forms/form-button';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getJetpackRecommendationsUrl from 'calypso/state/selectors/get-jetpack-recommendations-url';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { buildCheckoutURL } from '../../../get-purchase-url-callback';

import './style.scss';

const CtaButtons = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const onGetCompleteClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_complete_page_get_complete_click', {
				site_id: siteId,
			} )
		);
	}, [ dispatch, siteId ] );

	const onContinueFreeClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_complete_page_continue_free_click', {
				site_id: siteId,
			} )
		);
	}, [ dispatch, siteId ] );

	const checkoutURL = siteSlug
		? buildCheckoutURL( siteSlug, PLAN_JETPACK_COMPLETE )
		: `/checkout/${ PLAN_JETPACK_COMPLETE }`;

	const stayFreeURL = useSelector(
		( state ) => getJetpackRecommendationsUrl( state ) ?? 'https://jetpack.com'
	);

	return (
		<div className="jetpack-complete-page__cta-buttons">
			<Button
				className="jetpack-complete-page__get-complete-button"
				primary
				href={ checkoutURL }
				onClick={ onGetCompleteClick }
			>
				{ translate( 'Get Complete' ) }
			</Button>
			<Button
				className="jetpack-complete-page__start-free-button"
				href={ stayFreeURL }
				onClick={ onContinueFreeClick }
			>
				{ translate( 'Start for free' ) }
			</Button>
		</div>
	);
};

export default CtaButtons;
