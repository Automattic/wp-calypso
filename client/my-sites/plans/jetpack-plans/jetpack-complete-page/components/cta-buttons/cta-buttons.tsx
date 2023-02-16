import { PLAN_JETPACK_COMPLETE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

const CtaButtons = () => {
	const translate = useTranslate();
	const planToOffer = PLAN_JETPACK_COMPLETE;
	const siteSlug = useSelector( getSelectedSiteSlug );

	// handle no site selected
	const getCompleteURL = () => {
		if ( siteSlug ) {
			return `/checkout/${ siteSlug }/${ planToOffer }`;
		}
		return `https://wordpress.com/checkout/${ planToOffer }`;
	};

	//Start for free with no site, just redirect to jetpack.com
	const stayFreeURL = () => {
		if ( siteSlug ) {
			return `https://${ siteSlug }/wp-admin`;
		}
		return `https://jetpack.com/`;
	};
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
