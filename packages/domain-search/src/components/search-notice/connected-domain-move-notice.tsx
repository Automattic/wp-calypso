import { type DomainAvailability } from '@automattic/api-core';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Modal,
	Notice,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';

interface ConnectedDomainMoveNoticeProps {
	availability: DomainAvailability & { other_site_domain: string };
}

export const ConnectedDomainMoveNotice = ( { availability }: ConnectedDomainMoveNoticeProps ) => {
	const { cart, events } = useDomainSearch();
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );

	const domain = availability.domain_name;
	const site = availability.other_site_domain;

	// The FQDN is the only result offered here, so it takes the first position.
	const suggestion = {
		...convertAvailabilityToSuggestion( availability ),
		position: 0,
		price_rule: DomainPriceRule.DOMAIN_MOVE_PRICE,
	};

	const {
		mutate: moveDomain,
		isPending,
		error,
		reset,
	} = useMutation( {
		mutationFn: () => cart.onAddItem( suggestion ),
		onSuccess: () => {
			events.onAddDomainToCart(
				domain,
				suggestion.position,
				suggestion.is_premium ?? false,
				suggestion.vendor
			);
			setIsConfirmOpen( false );
		},
		networkMode: 'always',
		retry: false,
	} );

	const closeConfirm = () => {
		setIsConfirmOpen( false );
		reset();
	};

	return (
		<>
			<DomainSearchNotice status="info">
				{ createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name, %(site)s is the other site domain */
						__(
							'<strong>%(domain)s</strong> is already connected to your site %(site)s. Do you want to <button>move it to your new site</button>?'
						),
						{ domain, site }
					),
					{
						strong: <strong />,
						button: <button onClick={ () => setIsConfirmOpen( true ) } />,
					}
				) }
			</DomainSearchNotice>
			{ isConfirmOpen && (
				<Modal
					size="medium"
					title={
						/* translators: %s is the domain name */
						sprintf( __( 'Move %s to your new site?' ), domain )
					}
					onRequestClose={ closeConfirm }
					isDismissible={ ! isPending }
					shouldCloseOnClickOutside={ ! isPending }
					shouldCloseOnEsc={ ! isPending }
				>
					<VStack spacing={ 4 }>
						<p>
							{ sprintf(
								/* translators: %s is the other site domain */
								__( 'After checkout, %s will no longer be reachable at this domain.' ),
								site
							) }
						</p>
						{ availability.moves_email_subscriptions && (
							<p>
								{ sprintf(
									/* translators: %s is the domain name */
									__( 'Your email subscriptions for %s will move along with it.' ),
									domain
								) }
							</p>
						) }
						{ availability.requires_plan && (
							<p>{ __( 'Connected domains require a paid plan.' ) }</p>
						) }
						{ error && (
							<Notice status="error" isDismissible={ false }>
								{ error.message }
							</Notice>
						) }
						<HStack justify="flex-end">
							<Button
								variant="tertiary"
								onClick={ closeConfirm }
								disabled={ isPending }
								__next40pxDefaultSize
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									events.onSuggestionInteract( suggestion );
									moveDomain();
								} }
								isBusy={ isPending }
								disabled={ isPending }
								__next40pxDefaultSize
							>
								{ __( 'Use this domain' ) }
							</Button>
						</HStack>
					</VStack>
				</Modal>
			) }
		</>
	);
};
