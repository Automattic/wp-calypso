import { EmailDeliveryFrequency } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { Notice, NoticeState, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SiteSettings } from 'calypso/landing/subscriptions/components/settings/site-settings/site-settings';

type SiteSubscriptionSettingsProps = {
	value: SettingsFormState;
};

type SettingsFormState = Partial< {
	notifyMeOfNewPosts: boolean;
	emailMeNewPosts: boolean;
	deliveryFrequency: EmailDeliveryFrequency;
	emailMeNewComments: boolean;
} >;

const SubscriptionManager = {
	useSiteSubscriptionSettingsMutation: () => {
		return {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			mutate: ( _formState: SettingsFormState ) => undefined,
			isLoading: false,
			isSuccess: true,
			error: undefined as Error | undefined,
		};
	},
};

const DEFAULT_VALUE = {};

const SiteSubscriptionSettings = ( { value = DEFAULT_VALUE }: SiteSubscriptionSettingsProps ) => {
	const translate = useTranslate();
	const [ formState, setFormState ] = useState( value );
	const { mutate, isLoading, isSuccess, error } =
		SubscriptionManager.useSiteSubscriptionSettingsMutation();
	const [ notice, setNotice ] = useState< NoticeState | null >( null );

	useEffect( () => {
		// check if formState is empty object
		if ( value ) {
			setFormState( value );
		}
	}, [ value ] );

	useEffect( () => {
		if ( isSuccess ) {
			setNotice( { type: NoticeType.Success, message: translate( 'Settings saved' ) as string } );
		}
		if ( error ) {
			setNotice( { type: NoticeType.Error, message: error.message } );
		}
	}, [ error, isSuccess, translate ] );

	const onChange = ( newState: SettingsFormState ) => {
		setFormState( ( prevState ) => ( { ...prevState, ...newState } ) );
	};

	return (
		<form className="site-subscription-settings" onSubmit={ ( e ) => e.preventDefault() }>
			<Notice onClose={ () => setNotice( null ) } visible={ !! notice } type={ notice?.type }>
				{ notice?.message }
			</Notice>
			<h2 className="site-subscription-settings__heading">{ translate( 'Settings ' ) }</h2>
			<SiteSettings
				// NotifyMeOfNewPosts
				notifyMeOfNewPosts={ formState.notifyMeOfNewPosts }
				onNotifyMeOfNewPostsChange={ ( value ) => onChange( { notifyMeOfNewPosts: value } ) }
				updatingNotifyMeOfNewPosts={ isLoading }
				// EmailMeNewPosts
				emailMeNewPosts={ formState.emailMeNewPosts }
				onEmailMeNewPostsChange={ ( value ) => onChange( { emailMeNewPosts: value } ) }
				updatingEmailMeNewPosts={ isLoading }
				// DeliveryFrequency
				deliveryFrequency={ formState.deliveryFrequency }
				onDeliveryFrequencyChange={ ( value ) => onChange( { deliveryFrequency: value } ) }
				updatingFrequency={ isLoading }
				// EmailMeNewComments
				emailMeNewComments={ formState.emailMeNewComments }
				onEmailMeNewCommentsChange={ ( value ) => onChange( { emailMeNewComments: value } ) }
				updatingEmailMeNewComments={ isLoading }
			/>
			<Button
				className="site-subscription-settings__submit-button"
				isPrimary
				disabled={ isLoading }
				onClick={ () => mutate( formState ) }
				type="submit"
			>
				{ translate( 'Save changes' ) }
			</Button>
		</form>
	);
};

export default SiteSubscriptionSettings;
