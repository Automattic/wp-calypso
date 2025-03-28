import { Button } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import successImage from 'calypso/assets/images/marketplace/check-circle.svg';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Loading from 'calypso/components/loading';
import Main from 'calypso/components/main';
import { ThankYou } from 'calypso/components/thank-you';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import wpcom from 'calypso/lib/wp';

import './style.scss';

interface Site {
	name: string;
	URL: string;
}

function useSiteQuery( siteId: string | number ) {
	return useQuery< Site >( {
		queryKey: [ 'unauthorized-site', siteId ],
		queryFn: () => wpcom.req.get( { path: `/sites/${ siteId }`, apiVersion: '1.2' } ),
		meta: { persist: false },
	} );
}

export default function GiftThankYou( { site }: { site: number | string } ) {
	const translate = useTranslate();

	const siteRequest = useSiteQuery( site );
	const siteName = siteRequest.data?.name;
	const siteUrl = siteRequest.data?.URL;
	const siteUrlGifter = siteUrl + '#gift-thank-you';
	const isLoading = siteRequest.isLoading;
	const [ copyLabel, setCopyLabel ] = useState( translate( 'Copy Site URL' ) );

	const sections = [
		{
			sectionKey: 'whats_next',
			sectionTitle: translate( 'What’s next?' ),
			nextSteps: [
				{
					stepKey: 'visit_site',
					stepTitle: translate( 'Continue Browsing' ),
					stepDescription: translate(
						'Go back to the site you just supported to continue enjoying their content.'
					),
					stepCta: (
						<Button href={ siteUrlGifter } primary>
							{ translate( 'Visit site' ) }
						</Button>
					),
				},
				{
					stepKey: 'share_site',
					stepTitle: translate( 'Share this site' ),
					stepDescription: translate(
						'Know someone else who would enjoy the site you just supported? Click the button to copy the link and share with friends.'
					),
					stepCta: (
						<ClipboardButton
							text={ siteUrl || '' }
							onCopy={ () => {
								setCopyLabel( translate( 'Copied!' ) );
								setTimeout( () => setCopyLabel( translate( 'Copy Site URL' ) ), 4000 );
							} }
						>
							{ copyLabel }
						</ClipboardButton>
					),
				},
			],
		},
	];

	return (
		<Main className="gift-thank-you">
			<PageViewTracker path="/checkout/gift/thank-you/:site" title="Checkout > Thank You" />
			{ isLoading && (
				<div className="gift-thank-you__loader">
					<Loading />
				</div>
			) }
			{ ! isLoading && (
				<ThankYou
					containerClassName="gift-thank-you__container"
					sections={ sections }
					showSupportSection
					thankYouImage={ {
						alt: '',
						src: successImage,
						height: '63px',
						width: '63px',
					} }
					thankYouTitle={ translate( 'All done! Thank you for supporting %(siteName)s.', {
						args: { siteName: siteName ?? translate( 'this website' ) },
					} ) }
					thankYouHeaderBody={
						<div className="gift-thank-you__header-body">
							{ translate( 'Your {{b}}WordPress subscription payment{{/b}} has been successful.', {
								components: {
									b: <b />,
								},
							} ) }
							<br />
							{ translate( 'The receipt is in your email inbox.' ) }
						</div>
					}
					headerBackgroundColor="#fff"
					headerTextColor="#000"
				/>
			) }
		</Main>
	);
}
