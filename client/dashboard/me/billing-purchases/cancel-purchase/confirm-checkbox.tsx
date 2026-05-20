import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	CheckboxControl,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useHelpCenter } from '../../../app/help-center';
import { Text } from '../../../components/text';
import { DisplayVariant } from '../../../utils/purchase';
import { getCheckboxLabel } from './get-confirmation-copy';
import { useIsSplitCancelRemoveEnabled } from './use-is-split-cancel-remove-enabled';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface ConfirmCheckboxProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
}

export default function ConfirmCheckbox( {
	purchase,
	displayVariant,
	atomicTransfer,
	state,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
}: ConfirmCheckboxProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const { setNewMessagingChat } = useHelpCenter();

	const supportHeadingText =
		displayVariant === 'remove'
			? __( 'Questions before you remove?' )
			: __( 'Have a question before canceling?' );

	const planConfirmationLabel = getCheckboxLabel();

	const handleContactClick = () => {
		setNewMessagingChat( {
			initialMessage:
				displayVariant === 'remove'
					? `I have questions about removing my ${ purchase.product_name }. Can I speak with a human?`
					: `I have questions about canceling my ${ purchase.product_name }. Can I speak with a human?`,
			siteUrl: purchase.site_slug,
			siteId: String( purchase.blog_id ),
		} );
	};

	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Text weight="bold">{ supportHeadingText }</Text>
				<Text>
					{ createInterpolateElement(
						__( 'Our support team is here for you. <contactLink>Contact us</contactLink>' ),
						{
							contactLink: isSplitEnabled ? (
								<Button variant="link" onClick={ handleContactClick } />
							) : (
								<a href={ localizeUrl( 'https://wordpress.com/support' ) } />
							),
						}
					) }
				</Text>
			</VStack>

			<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />

			<VStack spacing={ 1 }>
				{ isDomainRegistrationPurchase && ! state.surveyShown && ! isSplitEnabled && (
					<CheckboxControl
						label={ __( 'I understand that canceling means that I may lose this domain forever.' ) }
						checked={ state.domainConfirmationConfirmed }
						onChange={ onDomainConfirmationChange }
						disabled={ state.isLoading }
					/>
				) }

				<CheckboxControl
					label={ planConfirmationLabel }
					checked={ state.customerConfirmedUnderstanding }
					disabled={ state.isLoading }
					onChange={ ( checked ) => {
						if ( atomicTransfer?.created_at ) {
							onCustomerConfirmedUnderstandingChange( checked );
							onCustomerConfirmedUnderstandingAtomicPlanRevert( checked );
							return;
						}

						onCustomerConfirmedUnderstandingChange( checked );
					} }
				/>
			</VStack>
		</VStack>
	);
}
