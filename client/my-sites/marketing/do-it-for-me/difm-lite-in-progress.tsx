import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useCurrentRoute } from 'calypso/components/route';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
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

function SupportLink( { children }: { children?: JSX.Element } ) {
	const translate = useTranslate();
	// Create URLSearchParams for send feedback by email command
	const { setNavigateToRoute, setShowHelpCenter, setSubject } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const emailUrl = `/contact-form?${ new URLSearchParams( {
		mode: 'EMAIL',
		'disable-gpt': 'true',
		'skip-resources': 'true',
	} ).toString() }`;

	return (
		<Button
			variant="link"
			className="difm-lite-in-progress__help-button"
			onClick={ () => {
				setNavigateToRoute( emailUrl );
				setSubject( translate( 'I have a question about my project' ) );
				setShowHelpCenter( true );
			} }
		>
			{ children }
		</Button>
	);
}

function WebsiteContentSubmissionPending( { siteId, siteSlug }: Props ) {
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

	const lineText = contentSubmissionDueDate
		? translate(
				'Click the button below to provide the content we need to build your site by %(contentSubmissionDueDate)s.',
				{
					args: {
						contentSubmissionDueDate: moment( contentSubmissionDueDate ).format( 'MMMM Do, YYYY' ),
					},
				}
		  )
		: translate( 'Click the button below to provide the content we need to build your site.' );

	return (
		<EmptyContent
			title={ translate( 'Website content not submitted' ) }
			line={
				<h3 className="empty-content__line">
					{ lineText }
					<br />
					{ translate(
						'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
						{
							components: {
								SupportLink: <SupportLink />,
							},
						}
					) }
				</h3>
			}
			action={ translate( 'Provide website content' ) }
			actionURL={ `/start/site-content-collection/website-content?siteSlug=${ siteSlug }` }
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
						"We are currently building your site and will send you an email when it's ready, within %d business days.",
						{
							args: [ 4 ],
						}
					) }
					<br />
					{ translate(
						'{{SupportLink}}Contact support{{/SupportLink}} if you have any questions.',
						{
							components: {
								SupportLink: <SupportLink />,
							},
						}
					) }
				</h3>
			}
			action={ translate( 'Manage domain' ) }
			actionURL={ domainManagementList( siteSlug, currentRoute ) }
			secondaryAction={ hasEmailWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
			secondaryActionURL={ getEmailManagementPath( siteSlug ) }
			secondaryActionCallback={ recordEmailClick }
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
				<EmptyContent className="difm-lite-in-progress__site-placeholder" />
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
