import { DomainSubtype } from '@automattic/api-core';
import { setWwwPrimaryDomainMutation, siteSetPrimaryDomainMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Modal,
	SelectControl,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useId, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { isSubdomain } from '../../utils/domain';
import PrimaryAddressIllustration from './primary-address-illustration';
import type { DomainSummary, Site } from '@automattic/api-core';
import './change-primary-domain-modal.scss';

interface ChangePrimaryDomainModalProps {
	site: Site;
	currentPrimaryDomain?: DomainSummary;
	eligibleDomains: DomainSummary[];
	onClose: () => void;
}

export default function ChangePrimaryDomainModal( {
	site,
	currentPrimaryDomain,
	eligibleDomains,
	onClose,
}: ChangePrimaryDomainModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const titleId = useId();
	const primaryAddress = currentPrimaryDomain?.domain ?? '';
	const addresses = [
		...( currentPrimaryDomain ? [ currentPrimaryDomain ] : [] ),
		...eligibleDomains,
	].flatMap( ( domain ) => {
		const plainAddress = { address: domain.domain, domain, www: false };
		const offersWww =
			site.is_wpcom_atomic &&
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS &&
			( !! domain.primary_is_www || ! isSubdomain( domain.domain ) );
		return offersWww
			? [ plainAddress, { address: `www.${ domain.domain }`, domain, www: true } ]
			: [ plainAddress ];
	} );
	const currentAddress =
		addresses.find(
			( { domain, www } ) => domain === currentPrimaryDomain && www === !! domain.primary_is_www
		)?.address ?? primaryAddress;
	const [ selectedDomain, setSelectedDomain ] = useState( currentAddress );
	const selected = addresses.find( ( { address } ) => address === selectedDomain );
	const errorSnackbar = { error: { source: 'server' as const } };
	const snackbar = {
		...errorSnackbar,
		success: sprintf(
			/* translators: %s is domain */
			__( 'Primary site address changed: all domains will redirect to %s.' ),
			selectedDomain
		),
	};
	const setPrimaryDomainMutation = useMutation(
		withSnackbar(
			siteSetPrimaryDomainMutation(),
			// The www request that follows shows the success message.
			selected?.www ? errorSnackbar : snackbar
		)
	);
	const setWwwMutation = useMutation( withSnackbar( setWwwPrimaryDomainMutation(), snackbar ) );
	const isPending = setPrimaryDomainMutation.isPending || setWwwMutation.isPending;

	const options = addresses.map( ( { address } ) => ( { label: address, value: address } ) );

	const canSubmit = !! selected && selectedDomain !== currentAddress && ! isPending;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit || ! selected ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_site_domains_primary_domain_selector_submit', {
			site: site.slug,
			domain: selectedDomain,
			www: selected.www,
		} );

		const domain = selected.domain.domain;
		const setWww = () =>
			setWwwMutation.mutate(
				{ siteId: site.ID, domain, enabled: selected.www },
				{ onSuccess: onClose }
			);

		if ( domain === primaryAddress ) {
			setWww();
			return;
		}

		setPrimaryDomainMutation.mutate(
			{ siteId: site.ID, domain },
			{ onSuccess: selected.www ? setWww : onClose }
		);
	};

	return (
		<Modal
			__experimentalHideHeader
			aria={ { labelledby: titleId } }
			onRequestClose={ onClose }
			size="medium"
			className="change-primary-domain-modal"
		>
			<PrimaryAddressIllustration />
			<Button
				className="change-primary-domain-modal__close"
				icon={ close }
				label={ __( 'Close' ) }
				onClick={ onClose }
				__next40pxDefaultSize
			/>
			<form className="change-primary-domain-modal__body" onSubmit={ handleSubmit }>
				<VStack spacing={ 6 }>
					<VStack spacing={ 2 }>
						<Heading id={ titleId } level={ 1 } size={ 20 } weight={ 700 }>
							{ __( 'Primary site address' ) }
						</Heading>
						{ currentAddress && (
							<Text as="p">
								{ createInterpolateElement(
									/* translators: <currentPrimaryDomain /> is the current primary site address, e.g. example.com */
									__(
										'The current primary site address for this site is <currentPrimaryDomain />. You can change it to a different one from the list below.'
									),
									{ currentPrimaryDomain: <strong>{ currentAddress }</strong> }
								) }
							</Text>
						) }
					</VStack>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Primary site address' ) }
						value={ selectedDomain }
						options={ options }
						disabled={ isPending }
						onChange={ setSelectedDomain }
					/>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ isPending }
							onClick={ onClose }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
							isBusy={ isPending }
							disabled={ ! canSubmit }
						>
							{ __( 'Change address' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
