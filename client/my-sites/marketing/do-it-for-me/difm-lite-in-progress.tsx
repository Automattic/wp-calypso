import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import SiteBuildInProgressIllustration from 'calypso/assets/images/difm/site-build-in-progress.svg';
import WebsiteContentRequiredIllustration from 'calypso/assets/images/difm/website-content-required.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDIFMLiteWebsiteContentSubmitted from 'calypso/state/selectors/is-difm-lite-website-content-submitted';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

import './difm-lite-in-progress.scss';

type DIFMLiteInProgressProps = {
	siteId: number;
};

function DIFMLiteInProgress( { siteId }: DIFMLiteInProgressProps ): React.ReactElement {
	const slug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);
	const primaryDomain = useSelector( ( state: AppState ) =>
		getPrimaryDomainBySiteId( state, siteId )
	);
	const translate = useTranslate();
	const dispatch = useDispatch();

	if ( ! primaryDomain ) {
		return (
			<>
				<QuerySiteDomains siteId={ siteId } />
				<EmptyContent
					className="difm-lite-in-progress__site-placeholder"
					illustration={ SiteBuildInProgressIllustration }
					illustrationWidth={ 144 }
				/>
			</>
		);
	}

	const hasEmailWithUs = hasGSuiteWithUs( primaryDomain ) || hasTitanMailWithUs( primaryDomain );
	const domainName = primaryDomain.name;

	const recordEmailClick = () => {
		const tracksName = hasEmailWithUs
			? 'calypso_difm_lite_in_progress_email_manage'
			: 'calypso_difm_lite_in_progress_email_cta';
		dispatch(
			recordTracksEvent( tracksName, {
				domain: domainName,
			} )
		);
	};

	return isWebsiteContentSubmitted ? (
		<EmptyContent
			title={ translate( 'Our experts are building your site' ) }
			line={ translate(
				"Our team is building your site. We'll be in touch when your site is ready."
			) }
			action={ translate( 'Manage domain' ) }
			actionURL={ domainManagementList( slug ) }
			secondaryAction={ hasEmailWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
			secondaryActionURL={ emailManagement( slug, null ) }
			secondaryActionCallback={ recordEmailClick }
			illustration={ SiteBuildInProgressIllustration }
			illustrationWidth={ 144 }
			className="difm-lite-in-progress__content"
		/>
	) : (
		<EmptyContent
			title={ translate( 'Website content not submitted' ) }
			line={ translate(
				'Please provide the necessary information for the creation of your website. To access click on the button below.'
			) }
			action={ translate( 'Add content to your website' ) }
			actionURL={ `/start/site-content-collection/website-content?siteSlug=${ slug }` }
			secondaryActionCallback={ recordEmailClick }
			illustration={ WebsiteContentRequiredIllustration }
			illustrationWidth={ 144 }
			className="difm-lite-in-progress__content"
		/>
	);
}

DIFMLiteInProgress.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default DIFMLiteInProgress;
