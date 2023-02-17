import { PLAN_JETPACK_COMPLETE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const CtaButtons = () => {
	const translate = useTranslate();
	const planToOffer = PLAN_JETPACK_COMPLETE;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const adminURL = useSelector( ( state ) => getJetpackAdminUrl( state, siteId ) );
	const getCompleteURL = siteSlug
		? `/checkout/${ siteSlug }/${ planToOffer }`
		: `/checkout/${ planToOffer }`;

	const stayFreeURL = siteSlug ? adminURL : `https://jetpack.com/`;
	return (
		<div className="jetpack-complete-page__cta-buttons">
			<Button
				className="jetpack-complete-page__get-complete-button"
				primary
				href={ getCompleteURL }
			>
				{ translate( 'Get Complete' ) }
			</Button>
			<Button className="jetpack-complete-page__start-free-button" href={ stayFreeURL }>
				{ translate( 'Start for free' ) }
			</Button>
		</div>
	);
};

export default CtaButtons;
