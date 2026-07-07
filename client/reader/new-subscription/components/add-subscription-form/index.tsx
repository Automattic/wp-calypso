import './style.scss';
import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import Notice from 'calypso/components/notice';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SiteSubscriptionsList } from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { UnsubscribedFeedsSearchList } from 'calypso/reader/site-subscriptions-manager/unsubscribed-feeds-search-list';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { ADD_SUBSCRIPTION_CONFIGS, SubscriptionType } from './consts';
const { useSiteSubscriptionsQueryProps } = SubscriptionManager;

// A brand-new feed (e.g. a subreddit) is often not resolved server-side at
// subscribe time, so the first `/read/following/mine` refetch can return it
// without a title. There is no push signal for when the feed resolves, so we
// re-fetch a few times with backoff to pick up the real title without a manual
// page refresh.
const RECONCILE_DELAYS_MS = [ 3000, 8000, 15000 ];

interface AddSubscriptionFormProps {
	type: SubscriptionType;
}

export default function AddSubscriptionForm( props: AddSubscriptionFormProps ): JSX.Element | null {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const [ hasFeedPreview, setHasFeedPreview ] = useState< boolean >( false );
	const config = ADD_SUBSCRIPTION_CONFIGS[ props.type ];
	const isAddNewTab = props.type === 'add-new';
	const { setSearchTerm, searchTerm } = useSiteSubscriptionsQueryProps();
	const hasSearchTerm = searchTerm && searchTerm.length > 0;
	const shouldShowSubscriptionsList = ! hasSearchTerm && ! hasFeedPreview;
	const shouldShowRelatedSitesList = hasSearchTerm && ! hasFeedPreview;

	const handleChangeFeedPreview = useCallback(
		( hasPreview: boolean ): void => {
			setHasFeedPreview( hasPreview );
		},
		[ setHasFeedPreview ]
	);

	const reconcileTimersRef = useRef< ReturnType< typeof setTimeout >[] >( [] );

	const clearReconcileTimers = useCallback( (): void => {
		reconcileTimersRef.current.forEach( clearTimeout );
		reconcileTimersRef.current = [];
	}, [] );

	useEffect( () => clearReconcileTimers, [ clearReconcileTimers ] );

	const handleSubscribeToggle = useCallback( (): void => {
		setHasFeedPreview( false ); // Close the feed preview when the subscription is toggled.

		// Do not refresh if we are on "Add New" tab. We show subscriptions list on that tab which takes care of the refresh.
		if ( isAddNewTab ) {
			return;
		}

		const invalidateSiteSubscriptions = (): Promise< void > =>
			queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );

		invalidateSiteSubscriptions();

		clearReconcileTimers();
		reconcileTimersRef.current = RECONCILE_DELAYS_MS.map( ( delay ) =>
			setTimeout( invalidateSiteSubscriptions, delay )
		);
	}, [ isAddNewTab, queryClient, clearReconcileTimers ] );

	// Updates SubscriptionList and UnsubscribedFeedsSearchList with the new search term.
	const handleChangeSearchTerm = useCallback(
		( value: string ): void => {
			setSearchTerm( value );
		},
		[ setSearchTerm ]
	);

	if ( ! config ) {
		return null;
	}

	const { slug, instructions: configInstructions } = config;
	return (
		<div className="reader-add-subscription">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				{ ! isEmailVerified && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Please verify your email before subscribing.' ) }
					>
						<a href="/me/account" className="calypso-notice__action">
							{ translate( 'Account Settings' ) }
						</a>
					</Notice>
				) }

				<div
					className={ `reader-add-subscription__form${ isEmailVerified ? '' : ' is-disabled' }` }
				>
					{ isAddNewTab && (
						<h2 className="reader-add-subscription__form-title">
							{ translate( 'Add new sites, newsletters, and RSS feeds to your reading list.' ) }
						</h2>
					) }

					<AddSitesForm
						placeholder={ config.placeholder }
						buttonText={ isAddNewTab ? undefined : translate( 'Add Feed' ) }
						pathname={ config.url }
						source={ config.source }
						onChangeFeedPreview={ handleChangeFeedPreview }
						onChangeSubscribe={ handleSubscribeToggle }
						onChange={ handleChangeSearchTerm }
						hideFeedPreview={ isAddNewTab }
						hideInputError={ isAddNewTab }
					/>
				</div>

				{ ! hasFeedPreview &&
					( configInstructions ? (
						<div className="reader-add-subscription__instructions">
							<div className="reader-add-subscription__instructions-icon">
								{ configInstructions.icon }
							</div>

							<h2 className="reader-add-subscription__instructions-title">
								{ configInstructions.title }
							</h2>

							<ul className="reader-add-subscription__instructions-list">
								{ configInstructions.infoList.map(
									( item, index ): JSX.Element => (
										<li key={ `${ slug }-${ index }` }>
											<strong>{ item.label }</strong> { item.info }
										</li>
									)
								) }
							</ul>
						</div>
					) : (
						<>
							{ shouldShowSubscriptionsList && (
								<>
									<h2 className="reader-add-subscription__subscriptions-title">
										{ translate( 'Your subscriptions' ) }
									</h2>
									<SiteSubscriptionsList layout="compact" />
								</>
							) }
							{ shouldShowRelatedSitesList && <UnsubscribedFeedsSearchList hideTitle /> }
						</>
					) ) }
			</SubscriptionManagerContextProvider>
		</div>
	);
}
