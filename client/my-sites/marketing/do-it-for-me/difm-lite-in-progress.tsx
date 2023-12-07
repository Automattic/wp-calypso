import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import SiteBuildInProgressIllustration from 'calypso/assets/images/difm/site-build-in-progress.svg';
import WebsiteContentRequiredIllustration from 'calypso/assets/images/difm/website-content-required.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useCurrentRoute } from 'calypso/components/route';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { useGetWebsiteContentQuery } from 'calypso/state/signup/steps/website-content/hooks/use-get-website-content-query';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { AppState, SiteId, SiteSlug } from 'calypso/types';

import './difm-lite-in-progress.scss';

type DIFMLiteInProgressProps = {
	siteId: number;
};

type Props = {
	primaryDomain: ResponseDomain;
	siteSlug: SiteSlug;
	siteId?: SiteId;
};

function WebsiteContentSubmissionPending( { primaryDomain, siteId, siteSlug }: Props ) {
	const translate = useTranslate();
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const difmPurchase = sitePurchases.find(
		( purchase ) => WPCOM_DIFM_LITE === purchase.productSlug
	);

	const moment = useLocalizedMoment();
	let contentSubmissionDueDate: number | null = null;
	if ( difmPurchase?.subscribedDate ) {
		const subscribedDate = new Date( difmPurchase.subscribedDate );
		contentSubmissionDueDate = subscribedDate.setDate(
			subscribedDate.getDate() + difmPurchase.refundPeriodInDays
		);
		// Due dates in the past are invalid.
		if ( contentSubmissionDueDate < Date.now() ) {
			contentSubmissionDueDate = null;
		}
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
	};

	const lineText = contentSubmissionDueDate
		? translate(
				'Click the button below to provide the content we need to build your site by %(contentSubmissionDueDate)s.{{br}}{{/br}}' +
					'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
				{
					...lineTextTranslateOptions,
					args: {
						contentSubmissionDueDate: moment( contentSubmissionDueDate ).format( 'MMMM Do, YYYY' ),
					},
				}
		  )
		: translate(
				'Click the button below to provide the content we need to build your site.{{br}}{{/br}}' +
					'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
				lineTextTranslateOptions
		  );

	return (
		<EmptyContent
			title={ translate( 'Website content not submitted' ) }
			line={ <h3 className="empty-content__line">{ lineText }</h3> }
			action={ translate( 'Provide website content' ) }
			actionURL={ `/start/site-content-collection/website-content?siteSlug=${ siteSlug }` }
			illustration={ WebsiteContentRequiredIllustration }
			illustrationWidth={ 144 }
			className="difm-lite-in-progress__content"
		/>
	);
}

function WebsiteContentSubmitted( { primaryDomain, siteSlug }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { currentRoute } = useCurrentRoute();

	const domainName = primaryDomain.name;
	const hasEmailWithUs = hasGSuiteWithUs( primaryDomain ) || hasTitanMailWithUs( primaryDomain );

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

	return (
		<EmptyContent
			title={ translate( 'Your content submission was successful!' ) }
			line={
				<h3 className="empty-content__line">
					{ translate(
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
				</h3>
			}
			action={ translate( 'Manage domain' ) }
			actionURL={ domainManagementList( siteSlug, currentRoute ) }
			secondaryAction={ hasEmailWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
			secondaryActionURL={ emailManagement( siteSlug, null ) }
			secondaryActionCallback={ recordEmailClick }
			illustration={ SiteBuildInProgressIllustration }
			illustrationWidth={ 144 }
			className="difm-lite-in-progress__content"
		/>
	);
}

function DIFMLiteInProgress( { siteId }: DIFMLiteInProgressProps ) {
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	useQuerySitePurchases( siteId );
	const isLoadingSitePurchases = useSelector( ( state: AppState ) =>
		isFetchingSitePurchases( state )
	);
	const { isLoading: isLoadingWebsiteContent, data: websiteContentQueryResult } =
		useGetWebsiteContentQuery( siteSlug );
	const primaryDomain = useSelector( ( state: AppState ) =>
		getPrimaryDomainBySiteId( state, siteId )
	);

	const isLoading = isLoadingSitePurchases || isLoadingWebsiteContent;

	if ( ! primaryDomain || ! siteSlug || isLoading ) {
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

	if ( websiteContentQueryResult?.isWebsiteContentSubmitted ) {
		return <WebsiteContentSubmitted primaryDomain={ primaryDomain } siteSlug={ siteSlug } />;
	}

	return (
		<WebsiteContentSubmissionPending
			primaryDomain={ primaryDomain }
			siteSlug={ siteSlug }
			siteId={ siteId }
		/>
	);
}

DIFMLiteInProgress.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default DIFMLiteInProgress;
