import './styles.scss';
import { prepareComparableUrl } from '@automattic/api-core';
import { FormInputValidation } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Button, SearchControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import { useAddSitesNotices } from 'calypso/landing/subscriptions/hooks';
import { useRecordSiteSubscribed } from 'calypso/landing/subscriptions/tracks';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';
import { getUrlQuerySearchTerm, setUrlQuery, SEARCH_QUERY_PARAM } from 'calypso/reader/utils';

interface AddSitesFormProps {
	placeholder?: string;
	buttonText?: string;
	pathname?: string; // Used to prevent search query changes on other pages.
	source: string;
	onChangeFeedPreview?: ( hasPreview: boolean ) => void;
	onChangeSubscribe?: ( subscribed: boolean ) => void;
	/**
	 * Callback function to be called when the input value changes.
	 * @param value - The new value of the input field.
	 */
	onChange?: ( value: string ) => void;
	/**
	 * Whether to hide the feed preview.
	 */
	hideFeedPreview?: boolean;
	/**
	 * Whether to hide the input error.
	 */
	hideInputError?: boolean;
}

type CachedFeedSearchItem = {
	feed_ID?: string | number | null;
	blog_ID?: string | number | null;
	subscribe_URL?: string;
};

const getFeedsFromSearchCacheData = ( data: unknown ): CachedFeedSearchItem[] => {
	if ( ! data || typeof data !== 'object' ) {
		return [];
	}

	// Explicit record access for opaque RQ cache blobs (`in` narrowing already satisfies tsc).
	const record = data as Record< string, unknown >;

	if ( Array.isArray( record.feeds ) ) {
		return record.feeds;
	}

	if ( Array.isArray( record.pages ) ) {
		return record.pages.flatMap( ( page: unknown ) => {
			if ( ! page || typeof page !== 'object' ) {
				return [];
			}
			const pageRecord = page as Record< string, unknown >;
			return Array.isArray( pageRecord.feeds ) ? pageRecord.feeds : [];
		} );
	}

	return [];
};

const findCachedFeedIdsForUrl = (
	queryClient: QueryClient,
	url: string
): { feed_id?: string | number; blog_id?: string | number } => {
	const comparableUrl = prepareComparableUrl( url );
	if ( ! comparableUrl ) {
		return {};
	}

	const cachedQueries = queryClient.getQueriesData( {
		queryKey: [ 'read', 'feeds', 'search' ],
	} );

	for ( const [ , data ] of cachedQueries ) {
		const matchingFeed = getFeedsFromSearchCacheData( data ).find(
			( feed ) => prepareComparableUrl( feed.subscribe_URL ) === comparableUrl
		);

		if ( matchingFeed ) {
			return {
				feed_id: matchingFeed.feed_ID ?? undefined,
				blog_id: matchingFeed.blog_ID || undefined,
			};
		}
	}

	return {};
};

const AddSitesForm = ( {
	onChange,
	placeholder,
	buttonText,
	pathname,
	source,
	onChangeFeedPreview,
	onChangeSubscribe,
	hideFeedPreview = false,
	hideInputError = false,
}: AddSitesFormProps ) => {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState< boolean >( false );
	const [ inputFieldError, setInputFieldError ] = useState< string | null >( null );
	const [ isValidInput, setIsValidInput ] = useState( false );
	const { showErrorNotice, showWarningNotice, showSuccessNotice } = useAddSitesNotices();
	const recordSiteSubscribed = useRecordSiteSubscribed();

	const { mutate: subscribe, isPending: subscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	// Triggers the text change when component mounts to validate the initial value.
	useEffect( () => onTextFieldChange( getUrlQuerySearchTerm( pathname ), true ), [] ); // eslint-disable-line react-hooks/exhaustive-deps

	function validateInputValue( url: string, showError = false ): void {
		// If the input is empty, we don't want to show an error message
		if ( url.length === 0 ) {
			setIsValidInput( false );
			setInputFieldError( null );
			onChangeFeedPreview?.( false );
			return;
		}

		if ( isValidUrl( url ) ) {
			setInputFieldError( null );
			setIsValidInput( true );
		} else {
			setIsValidInput( false );
			onChangeFeedPreview?.( false );
			if ( showError ) {
				setInputFieldError( translate( 'Please enter a valid URL' ) );
			}
		}
	}

	function onTextFieldChange( value: string, showErrorOnInvalidUrl: boolean = false ): void {
		setUrlQuery( SEARCH_QUERY_PARAM, value, pathname ); // Update url query when search term changes.
		setInputValue( value );
		validateInputValue( value, showErrorOnInvalidUrl );
		onChange?.( value );
	}

	const onSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( isValidInput ) {
			const url = parseUrl( inputValue ).toString();
			const cachedFeedIds = findCachedFeedIdsForUrl( queryClient, url );
			setIsSubmitting( true );
			subscribe(
				{
					url,
					...cachedFeedIds,
				},
				{
					onSuccess: ( data ) => {
						if ( data?.info === 'already_subscribed' ) {
							showWarningNotice( inputValue );
						} else {
							if ( data?.subscription?.blog_ID ) {
								recordSiteSubscribed( {
									blog_id: data?.subscription?.blog_ID,
									url: inputValue,
									source,
								} );
							}

							showSuccessNotice( inputValue );
							onSubscribeToggle( true );
						}
					},
					onError: ( error ) => {
						showErrorNotice( inputValue, error );
						onChangeSubscribe?.( false );
					},
					onSettled: (): void => {
						setIsSubmitting( false );
					},
				}
			);
		}
	};

	function onSubscribeToggle( subscribed: boolean ): void {
		// Fully reset form + shared search term so related-sites results unmount.
		onTextFieldChange( '' );
		onChangeSubscribe?.( subscribed );
	}

	const showInputError = inputFieldError && ! hideInputError;

	return (
		<>
			<form onSubmit={ onSubmit } className="subscriptions-add-sites__form--container">
				<div className="subscriptions-add-sites__form-field">
					<SearchControl
						className={ clsx( 'subscriptions-add-sites__form-input', {
							'is-error': !! showInputError,
						} ) }
						disabled={ subscribing }
						placeholder={ placeholder || 'https://www.site.com' }
						value={ inputValue }
						onChange={ onTextFieldChange }
						onBlur={ () => validateInputValue( inputValue, true ) }
						__next40pxDefaultSize
					/>

					{ showInputError ? <FormInputValidation isError text={ inputFieldError } /> : null }
				</div>

				<Button
					variant="primary"
					className="button subscriptions-add-sites__save-button"
					disabled={ ! inputValue || ! isValidInput || subscribing }
					isBusy={ isSubmitting }
					type="submit"
					__next40pxDefaultSize
				>
					{ buttonText || translate( 'Add site' ) }
				</Button>
			</form>

			{ ! hideFeedPreview && (
				<FeedPreview
					url={ isValidInput ? inputValue : '' } // Passing empty state to make sure that debounce works correctly else it was firing events 2 times.
					source={ source }
					onChangeFeedPreview={ onChangeFeedPreview }
					onChangeSubscribe={ onSubscribeToggle }
				/>
			) }
		</>
	);
};

export default AddSitesForm;
