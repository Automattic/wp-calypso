import { Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useState } from 'react';
import CountedTextArea from 'calypso/components/forms/counted-textarea';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSiteSettings, saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const MAX_LENGTH_FREE_TIER_DESCRIPTION = 500;

type FreePlanModalProps = {
	closeDialog: () => void;
	siteId?: number;
};

type SubscriptionOptions = {
	free_tier_description?: string;
	hide_free_tier?: boolean | number;
};

const FreePlanModal = ( { closeDialog, siteId }: FreePlanModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const targetSiteId = siteId ?? selectedSiteId;
	const settings = useSelector( ( state ) => getSiteSettings( state, targetSiteId ) );
	const subscriptionOptions: SubscriptionOptions = settings?.subscription_options ?? {};

	const [ editedDescription, setEditedDescription ] = useState(
		subscriptionOptions.free_tier_description ?? ''
	);
	const [ hideFreeTier, setHideFreeTier ] = useState(
		Boolean( subscriptionOptions.hide_free_tier )
	);
	// Tracks whether the user has touched the form, so a late-arriving settings
	// fetch can prefill the fields without clobbering in-progress edits.
	const [ isDirty, setIsDirty ] = useState( false );

	// If site settings load after the modal mounts (request still in-flight),
	// hydrate the fields from the saved values — but only while pristine.
	useEffect( () => {
		if ( isDirty ) {
			return;
		}
		setEditedDescription( subscriptionOptions.free_tier_description ?? '' );
		setHideFreeTier( Boolean( subscriptionOptions.hide_free_tier ) );
	}, [ subscriptionOptions.free_tier_description, subscriptionOptions.hide_free_tier, isDirty ] );

	const isFormValid = () => editedDescription.trim().length <= MAX_LENGTH_FREE_TIER_DESCRIPTION;

	const onClose = ( reason: string | undefined ) => {
		if ( reason === 'submit' && targetSiteId ) {
			const trimmedDescription = editedDescription.trim();
			dispatch(
				saveSiteSettings( targetSiteId, {
					subscription_options: {
						...subscriptionOptions,
						free_tier_description: trimmedDescription,
						// Sent as 1/0 (not a boolean) so the value survives form-encoding
						// without PHP treating a "false" string as truthy server-side.
						hide_free_tier: hideFreeTier ? 1 : 0,
					},
				} )
			).then( ( response: { updated?: unknown } | undefined ) => {
				// `saveSiteSettings` resolves for both success and failure (it returns
				// the error object from its own `.catch`), so only proceed when the
				// response carries `updated`, which a successful save always does.
				if ( ! response?.updated ) {
					return;
				}
				// Refetch site settings so the Free row preview picks up the new
				// `free_tier_description_rendered`. That field is rendered by the same
				// endpoint that just saved the description, so it's read-after-write
				// consistent — no polling needed.
				dispatch( requestSiteSettings( targetSiteId ) );
				dispatch(
					recordTracksEvent( 'calypso_earn_page_free_plan_updated', {
						hide_free_tier: hideFreeTier,
					} )
				);
			} );
		}
		closeDialog();
	};

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_earn_page_free_plan_modal_show' ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<Dialog
			isVisible
			onClose={ onClose }
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: translate( 'Save' ),
					action: 'submit',
					disabled: ! isFormValid() || ! targetSiteId,
					isPrimary: true,
				},
			] }
		>
			<FormSectionHeading>{ translate( 'Edit Free plan options' ) }</FormSectionHeading>
			<div className="free-plan-modal__sections">
				<FormFieldset>
					<FormLabel htmlFor="free-plan-title">{ translate( 'Plan name' ) }</FormLabel>
					<FormTextInput id="free-plan-title" value={ translate( 'Free' ) } disabled />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="free-plan-price">{ translate( 'Price' ) }</FormLabel>
					<FormTextInput id="free-plan-price" value={ translate( 'Free' ) } disabled />
					<FormSettingExplanation>
						{ translate(
							"The free plan can't be renamed or priced. You can customize its description and choose whether to show it to subscribers."
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="free-tier-description">
						{ translate( 'Describe what subscribers get at this tier' ) }
					</FormLabel>
					<CountedTextArea
						id="free-tier-description"
						value={ editedDescription }
						onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) => {
							setIsDirty( true );
							setEditedDescription( event.target.value );
						} }
						acceptableLength={ MAX_LENGTH_FREE_TIER_DESCRIPTION }
						showRemainingCharacters
						placeholder={ translate(
							'e.g. A free taste of the newsletter with the occasional public post'
						) }
					/>
					<FormSettingExplanation>
						{ translate(
							'Optional. Shown to readers when they choose a newsletter tier on your site. Basic {{a}}Markdown{{/a}} — bold, italics, lists, and links — is supported.',
							{
								components: {
									a: (
										<a
											href={ localizeUrl(
												'https://wordpress.com/support/markdown-quick-reference/'
											) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>
					{ ! isFormValid() && (
						<FormInputValidation
							isError
							text={ translate( 'Description must be %(max)d characters or fewer.', {
								args: { max: MAX_LENGTH_FREE_TIER_DESCRIPTION },
							} ) }
						/>
					) }
				</FormFieldset>
				<FormFieldset>
					<ToggleControl
						checked={ hideFreeTier }
						onChange={ ( newValue: boolean ) => {
							setIsDirty( true );
							setHideFreeTier( newValue );
						} }
						label={ translate( 'Hide the free plan from the options shown to new subscribers' ) }
					/>
					<FormSettingExplanation>
						{ translate(
							'When hidden, new subscribers must choose a paid tier. People who are already subscribed are not affected.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
			</div>
		</Dialog>
	);
};

export default FreePlanModal;
