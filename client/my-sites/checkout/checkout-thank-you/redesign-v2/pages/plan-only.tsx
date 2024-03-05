import { isP2Plus } from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { getSiteOptions, getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYouPlanProduct from '../products/plan-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const VERIFY_EMAIL_ERROR_NOTICE = 'ecommerce-verify-email-error';
const RESEND_ERROR = 'RESEND_ERROR';
const RESEND_NOT_SENT = 'RESEND_NOT_SENT';
const RESEND_PENDING = 'RESEND_PENDING';
const RESEND_SUCCESS = 'RESEND_SUCCESS';
interface PlanOnlyThankYouProps {
	primaryPurchase: ReceiptPurchase;
	isEmailVerified: boolean;
}

const isMonthsOld = ( months: number, rawDate?: string ) => {
	if ( ! rawDate ) {
		return false;
	}

	const parsedDate = moment( rawDate );
	return moment().diff( parsedDate, 'months' ) > months;
};

export default function PlanOnlyThankYou( {
	primaryPurchase,
	isEmailVerified,
}: PlanOnlyThankYouProps ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const emailAddress = useSelector( getCurrentUserEmail );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const [ resendStatus, setResendStatus ] = useState( RESEND_NOT_SENT );

	const resendEmail = () => {
		removeNotice( VERIFY_EMAIL_ERROR_NOTICE );

		if ( RESEND_PENDING === resendStatus ) {
			return;
		}

		setResendStatus( RESEND_PENDING );

		wpcom.req.post( '/me/send-verification-email', ( error: Error ) => {
			if ( error ) {
				errorNotice( translate( "Couldn't resend verification email. Please try again." ), {
					id: VERIFY_EMAIL_ERROR_NOTICE,
				} );

				setResendStatus( RESEND_ERROR );
				return;
			}

			setResendStatus( RESEND_SUCCESS );
		} );
	};

	const resendButtonText = () => {
		switch ( resendStatus ) {
			case RESEND_PENDING:
				return translate( 'Sending…' );
			case RESEND_SUCCESS:
				return translate( 'Email sent' );
			case RESEND_NOT_SENT:
			case RESEND_ERROR:
			default:
				return translate( 'Resend email' );
		}
	};

	let subtitle;
	// At this point in the flow, having purchased a plan for a specific site,
	// we can be confident that `siteId` is a number and not `null`
	const siteAdminUrl = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId as number ) );

	let headerButtons;
	if ( primaryPurchase.productSlug === 'ecommerce-bundle' ) {
		if ( isEmailVerified ) {
			subtitle = translate( "With the plan sorted, it's time to start setting up your store." );
			headerButtons = typeof siteAdminUrl === 'string' && (
				<Button variant="primary" href={ siteAdminUrl }>
					Create your store
				</Button>
			);
		} else {
			subtitle = translate(
				"{{paragraph}}With the plan sorted, verify your email address to create your store.{{br/}}Please click the link in the email we sent to %(emailAddress)s.{{/paragraph}}{{paragraph}}If you haven't received the verification email, please click here.{{/paragraph}}",
				{
					args: { emailAddress: emailAddress },
					components: { paragraph: <p />, br: <br /> },
				}
			);
			headerButtons = (
				<Button variant="secondary" onClick={ resendEmail }>
					{ resendButtonText() }
				</Button>
			);
		}
	} else {
		subtitle = translate(
			'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
			{
				args: { productName: primaryPurchase.productName },
				components: { strong: <strong /> },
			}
		);
	}

	const footerDetails = [];

	if ( isP2Plus( primaryPurchase ) ) {
		footerDetails.push( {
			key: 'footer-add-members',
			title: translate( 'Go further, together' ),
			description: translate(
				'Invite people to the P2 to create a fully interactive work environment and start getting better results.'
			),
			buttonText: translate( 'Add members' ),
			buttonHref: `/people/new/${ siteSlug }`,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'plan-only',
					type: 'add-members',
				} );
			},
		} );
	} else if ( isMonthsOld( 6, siteCreatedTimeStamp ) ) {
		// Promote themes in the footer details for sites that are 6 months old or older.
		footerDetails.push( {
			key: 'footer-site-refresh',
			title: translate( 'A site refresh' ),
			description: translate(
				'A new look and feel can help you stand out from the crowd. Get a new theme and make an impression.'
			),
			buttonText: translate( 'Find your new theme' ),
			buttonHref: `/themes/${ siteSlug }`,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'plan-only',
					type: 'site-refresh',
				} );
			},
		} );
	}

	footerDetails.push( {
		key: 'footer-support',
		title: translate( 'Everything you need to know' ),
		description: translate( 'Explore our support guides and find an answer to every question.' ),
		buttonText: translate( 'Explore support resources' ),
		buttonHref: '/support',
		buttonOnClick: () => {
			recordTracksEvent( 'calypso_thank_you_footer_link_click', {
				context: 'plan-only',
				type: 'support',
			} );
		},
	} );

	return (
		<ThankYouV2
			title={ translate( 'Get the best out of your site' ) }
			subtitle={ preventWidows( subtitle ) }
			headerButtons={ headerButtons }
			products={
				<ThankYouPlanProduct purchase={ primaryPurchase } siteSlug={ siteSlug } siteId={ siteId } />
			}
			footerDetails={ footerDetails }
		/>
	);
}
