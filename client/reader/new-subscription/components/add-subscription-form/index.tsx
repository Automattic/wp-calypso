import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SiteSubscriptionsList } from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { ADD_SUBSCRIPTION_CONFIGS, SubscriptionType } from './consts';

interface AddSubscriptionFormProps {
	type: SubscriptionType;
}

export default function AddSubscriptionForm( props: AddSubscriptionFormProps ): JSX.Element | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const [ hasFeedPreview, setHasFeedPreview ] = useState< boolean >( false );
	const config = ADD_SUBSCRIPTION_CONFIGS[ props.type ];
	const isAddNewTab = props.type === 'add-new';

	const onChangeFeedPreview = useCallback( ( hasPreview: boolean ): void => {
		setHasFeedPreview( hasPreview );
	}, [] );

	const onSubscribeToggle = useCallback( (): void => {
		setHasFeedPreview( false ); // Close the feed preview when the subscription is toggled.

		// Do not refresh if we are on "Add New" tab. We show subscriptions list on that tab which takes care of the refresh.
		if ( ! isAddNewTab ) {
			dispatch( requestFollows() );
		}
	}, [ dispatch, isAddNewTab ] );

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
						pathname={ config.pathname }
						source={ config.source }
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
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
							<h2 className="reader-add-subscription__subscriptions-title">
								{ translate( 'Your subscriptions' ) }
							</h2>

							<SiteSubscriptionsList layout="compact" />
						</>
					) ) }
			</SubscriptionManagerContextProvider>
		</div>
	);
}
