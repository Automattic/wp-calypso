import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import SiteBuildInProgressIllustration from 'calypso/assets/images/difm/site-build-in-progress.svg';
import WebsiteContentRequiredIllustration from 'calypso/assets/images/difm/website-content-required.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDIFMLiteWebsiteContentSubmitted from 'calypso/state/selectors/is-difm-lite-website-content-submitted';
import { getSiteSlug, isRequestingSite, isRequestingSites } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

import './difm-lite-in-progress.scss';

type DIFMLiteInProgressProps = {
	siteId: number;
};

function DIFMLiteInProgress( { siteId }: DIFMLiteInProgressProps ) {
	const slug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	useQuerySitePurchases( siteId );
	const isLoadingSite = useSelector(
		( state: AppState ) =>
			isRequestingSite( state, siteId ) ||
			isRequestingSites( state ) ||
			isFetchingSitePurchases( state )
	);
	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);
	const primaryDomain = useSelector( ( state: AppState ) =>
		getPrimaryDomainBySiteId( state, siteId )
	);
	const translate = useTranslate();
	const dispatch = useDispatch();

	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const difmPurchase = sitePurchases.find(
		( purchase ) => WPCOM_DIFM_LITE === purchase.productSlug
	);

	const moment = useLocalizedMoment();
	let contentSubmissionDueDate: string | null = null;
	if ( difmPurchase?.subscribedDate ) {
		const subscribedDate = new Date( difmPurchase.subscribedDate );
		subscribedDate.setDate( subscribedDate.getDate() + difmPurchase.refundPeriodInDays );
		// Due dates in the past are invalid.
		if ( subscribedDate.getTime() > Date.now() ) {
			contentSubmissionDueDate = moment( subscribedDate ).format( 'MMMM Do, YYYY' );
		}
	}

	if ( ! primaryDomain || isLoadingSite ) {
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

	if ( isWebsiteContentSubmitted ) {
		return (
			<EmptyContent
				title={ translate( 'Your content submission was successful!' ) }
				line={ translate(
					"We are currently building your site and will send you an email when it's ready, within %d business days.{{br}}{{/br}}" +
						'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
					{
						components: {
							br: <br />,
							SupportLink: (
								<a
									href={ `mailto:builtby+express@wordpress.com?subject=${ encodeURIComponent(
										`I need help with my site: ${ primaryDomain.domain }`
									) }` }
								/>
							),
						},
						args: [ 4 ],
					}
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
		);
	}

	const lineTextTranslateOptions = {
		components: {
			br: <br />,
			SupportLink: (
				<a
					href={ `mailto:builtby+express@wordpress.com?subject=${ encodeURIComponent(
						`I need help with my site: ${ primaryDomain.domain }`
					) }` }
				/>
			),
		},
		args: {
			contentSubmissionDueDate,
		},
	};

	const lineText = contentSubmissionDueDate
		? translate(
				'Click the button below to provide the content we need to build your site by %(contentSubmissionDueDate)s.{{br}}{{/br}}' +
					'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
				lineTextTranslateOptions
		  )
		: translate(
				'Click the button below to provide the content we need to build your site.{{br}}{{/br}}' +
					'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
				lineTextTranslateOptions
		  );

	return (
		<EmptyContent
			title={ translate( 'Website content not submitted' ) }
			line={ lineText }
			action={ translate( 'Provide website content' ) }
			actionURL={ `/start/site-content-collection/website-content?siteSlug=${ slug }` }
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
