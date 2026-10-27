import { siteSetPrimaryDomainMutation } from '@automattic/api-queries';
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
import PrimaryAddressIllustration from './primary-address-illustration';
import type { DomainSummary, Site } from '@automattic/api-core';
import './change-primary-domain-modal.scss';

interface ChangePrimaryDomainModalProps {
	site: Site;
	currentPrimaryDomain?: string;
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
	const [ selectedDomain, setSelectedDomain ] = useState( currentPrimaryDomain ?? '' );
	const setPrimaryDomainMutation = useMutation(
		withSnackbar( siteSetPrimaryDomainMutation(), {
			success: sprintf(
				/* translators: %s is domain */
				__( 'Primary site address changed: all domains will redirect to %s.' ),
				selectedDomain
			),
			error: { source: 'server' },
		} )
	);

	const options = [
		...( currentPrimaryDomain
			? [ { label: currentPrimaryDomain, value: currentPrimaryDomain } ]
			: [] ),
		...eligibleDomains.map( ( { domain } ) => ( { label: domain, value: domain } ) ),
	];

	const canSubmit =
		!! selectedDomain &&
		selectedDomain !== currentPrimaryDomain &&
		! setPrimaryDomainMutation.isPending;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( ! canSubmit ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_site_domains_primary_domain_selector_submit', {
			site: site.slug,
			domain: selectedDomain,
		} );

		setPrimaryDomainMutation.mutate(
			{ siteId: site.ID, domain: selectedDomain },
			{ onSuccess: onClose }
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
						<Heading id={ titleId } level={ 1 } size={ 20 } weight={ 600 }>
							{ __( 'Primary site address' ) }
						</Heading>
						{ currentPrimaryDomain && (
							<Text as="p">
								{ createInterpolateElement(
									sprintf(
										/* translators: %s is the current primary site address, e.g. example.com */
										__(
											'The current primary site address for this site is <strong>%s</strong>. You can change it to a different one from the list below.'
										),
										currentPrimaryDomain
									),
									{ strong: <strong /> }
								) }
							</Text>
						) }
					</VStack>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Primary site address' ) }
						value={ selectedDomain }
						options={ options }
						onChange={ setSelectedDomain }
					/>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ setPrimaryDomainMutation.isPending }
							onClick={ onClose }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
							isBusy={ setPrimaryDomainMutation.isPending }
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
