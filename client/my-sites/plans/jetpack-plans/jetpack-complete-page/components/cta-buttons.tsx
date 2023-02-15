//imports
import { useTranslate } from 'i18n-calypso';
//import Button component
import { useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

//create a new function to render cta buttons
const CtaButtons = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	return (
		<div className="jetpack-complete-page__cta-buttons">
			<Button className="jetpack-complete-page__get-complete-button" primary>
				{ translate( 'Get Complete' ) }
			</Button>
			<Button
				className="jetpack-complete-page__start-free-button"
				href={ `https://${ siteSlug }/wp-admin` }
			>
				{ translate( 'Start for free' ) }
			</Button>
		</div>
	);
};

//export renderCtaButtons component as CtaButtons
export default CtaButtons;
