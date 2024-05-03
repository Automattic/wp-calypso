import {
	isMonthly,
	isPersonal,
	isPremium,
	isP2Plus,
	isWpComEcommercePlan,
	PLAN_BUSINESS,
	getPlan,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import { connect } from 'react-redux';
import formatCurrency from 'calypso/../packages/format-currency/src';
import upsellBusinessPlanImage from 'calypso/assets/images/thank-you-upsell/upsellBusinessPlanImage.jpg';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import WpAdminAutoLogin from 'calypso/components/wpadmin-auto-login';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getSiteOptions, getSiteUrl, getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYouPlanProduct from '../products/plan-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';
import type { IAppState } from 'calypso/state/types';
import type { TranslateResult } from 'i18n-calypso';

const RESEND_ERROR = 'RESEND_ERROR';
const RESEND_NOT_SENT = 'RESEND_NOT_SENT';
const RESEND_PENDING = 'RESEND_PENDING';
const RESEND_SUCCESS = 'RESEND_SUCCESS';

interface PlanOnlyProps {
	primaryPurchase: ReceiptPurchase;
	isEmailVerified: boolean;
	transferComplete?: boolean;
}

interface PlanOnlyThankYouProps extends PlanOnlyProps {
	promotePlanData?: {
		planName: TranslateResult;
		pathSlug: string;
		refundPeriodDays: number;
		fullPrice: string;
		discountPrice: string;
	};
	errorNotice: ( text: string, noticeOptions?: object ) => void;
	removeNotice: ( noticeId: string ) => void;
	successNotice: ( text: string, noticeOptions?: object ) => void;
}

const isMonthsOld = ( months: number, rawDate?: string ) => {
	if ( ! rawDate ) {
		return false;
	}

	const parsedDate = moment( rawDate );
	return moment().diff( parsedDate, 'months' ) > months;
};

const PlanOnlyThankYou = ( {
	primaryPurchase,
	isEmailVerified,
	errorNotice,
	removeNotice,
	successNotice,
	transferComplete,
	promotePlanData,
}: PlanOnlyThankYouProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const [ resendStatus, setResendStatus ] = useState( RESEND_NOT_SENT );

	const verifyEmailNoticeId = 'ecommerce-verify-email-notice';
	const resendEmail = () => {
		removeNotice( verifyEmailNoticeId );

		if ( RESEND_PENDING === resendStatus ) {
			return;
		}

		setResendStatus( RESEND_PENDING );

		wpcom.req.post( '/me/send-verification-email', ( error: Error ) => {
			if ( error ) {
				errorNotice( translate( "Couldn't resend verification email. Please try again." ), {
					id: verifyEmailNoticeId,
					duration: 5000,
				} );

				setResendStatus( RESEND_ERROR );
				return;
			}

			successNotice( translate( 'Email sent' ), { id: verifyEmailNoticeId, duration: 5000 } );

			setResendStatus( RESEND_SUCCESS );
		} );
	};

	const resendButtonText = () => {
		if ( resendStatus === RESEND_PENDING ) {
			return translate( 'Sending…' );
		}

		return translate( 'Resend email' );
	};

	// At this point in the flow, having purchased a plan for a specific site,
	// we can be confident that `siteId` is a number and not `null`
	const siteAdminUrl = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId as number ) );
	const emailAddress = useSelector( getCurrentUserEmail );

	let subtitle;
	let headerButtons;

	if ( isWpComEcommercePlan( primaryPurchase.productSlug ) ) {
		if ( isEmailVerified ) {
			subtitle = translate( "With the plan sorted, it's time to start setting up your store." );
			headerButtons = typeof siteAdminUrl === 'string' && (
				<Button href={ siteAdminUrl } primary>
					Create your store
				</Button>
			);
		} else {
			subtitle = translate(
				"{{paragraph}}With the plan sorted, verify your email address to create your store.{{br/}}Please click the link in the email we sent to {{strong}}%(emailAddress)s{{/strong}}.{{/paragraph}}{{paragraph}}If you haven't received the verification email, please {{a}}click here{{/a}}.{{/paragraph}}",
				{
					args: { emailAddress: emailAddress },
					components: {
						paragraph: <p />,
						br: <br />,
						strong: <strong />,
						a: <Button plain onClick={ resendEmail } />,
					},
				}
			);

			const isSendingEmail = resendStatus === RESEND_PENDING;

			headerButtons = (
				<Button
					onClick={ resendEmail }
					busy={ isSendingEmail }
					disabled={ isSendingEmail || resendStatus === RESEND_SUCCESS }
				>
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

	let upsellProps;
	if ( promotePlanData ) {
		upsellProps = {
			title: translate( 'Advanced tools' ),
			description: (
				<>
					{ translate(
						'Get the %(planName)s plan for access to WordPress plugins, STFP setup, database credentials, and more, propelling your site to new heights. Upgrade risk-free with our %(refundPeriodDays)s-day money-back guarantee, and pay only the difference ({{s}}%(fullPrice)s{{/s}} %(discountPrice)s).',
						{
							comment: 'Upsell for WP Business plan on checkout thank you page',
							args: promotePlanData,
							components: { s: <s /> },
						}
					) }
				</>
			),
			image: upsellBusinessPlanImage,
			actions: (
				<>
					<Button
						onClick={ () => {
							recordTracksEvent( 'calypso_plan_only_thank_you_upgrade_business_click' );

							page( `/checkout/${ promotePlanData.pathSlug }/${ siteSlug }` );
						} }
					>
						{ translate( 'Upgrade' ) }
					</Button>
				</>
			),
		};
	}

	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId as number ) );

	return (
		<>
			{
				// If an ecommerce site is verified and completely transferred,
				// automatically log the user into the wp-admin.
				isWpComEcommercePlan( primaryPurchase.productSlug ) &&
					transferComplete &&
					isEmailVerified && <WpAdminAutoLogin site={ { URL: siteUrl } } delay={ 0 } />
			}
			<ThankYouV2
				title={ translate( 'Get the best out of your site' ) }
				subtitle={ preventWidows( subtitle ) }
				headerButtons={ headerButtons }
				products={
					<ThankYouPlanProduct
						purchase={ primaryPurchase }
						siteSlug={ siteSlug }
						siteId={ siteId }
					/>
				}
				footerDetails={ footerDetails }
				upsellProps={ upsellProps }
			/>
		</>
	);
};

function getBusinessPlanSlugToUpgrade( currentPlanSlug: string ) {
	const currentPlan = getPlan( currentPlanSlug );
	const planKey = findFirstSimilarPlanKey( PLAN_BUSINESS, { term: currentPlan?.term } );

	// It's just for TS, since .find() can return undefined
	if ( ! planKey ) {
		return;
	}

	return getPlan( planKey );
}

export default connect(
	( state: IAppState, props: PlanOnlyProps ) => {
		let promotePlanData;
		if ( isPersonal( props.primaryPurchase ) || isPremium( props.primaryPurchase ) ) {
			const promotePlan = getBusinessPlanSlugToUpgrade( props.primaryPurchase.productSlug );
			const promotePlanSlug = promotePlan?.getStoreSlug() || '';

			const pathSlug = promotePlan?.getPathSlug?.();
			const selectedSiteId = getSelectedSiteId( state ) || 0;
			const currencyCode = getCurrentUserCurrencyCode( state );

			const businessPrice = getSitePlanRawPrice( state, selectedSiteId, promotePlanSlug, {
				returnMonthly: false,
			} );
			const businessDiscountPrice = getPlanDiscountedRawPrice(
				state,
				selectedSiteId,
				promotePlanSlug,
				{
					returnMonthly: false,
				}
			);

			// The condition is just for TS fix
			if ( businessPrice && businessDiscountPrice && currencyCode && promotePlan && pathSlug ) {
				promotePlanData = {
					planName: promotePlan.getTitle(),
					pathSlug: pathSlug,
					refundPeriodDays: isMonthly( promotePlanSlug ) ? 7 : 14,
					fullPrice: formatCurrency( businessPrice, currencyCode, { stripZeros: true } ),
					discountPrice: formatCurrency( businessDiscountPrice, currencyCode, {
						stripZeros: true,
					} ),
				};
			}
		}

		return {
			promotePlanData,
		};
	},
	{
		errorNotice,
		removeNotice,
		successNotice,
	}
)( PlanOnlyThankYou );
