import { Button, Notice, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { User } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PairingCardProps {
	title: string;
	description: string;
	decoration?: ReactNode;
	error?: string;
	connectLabel: string;
	isBusy: boolean;
	onConnect: () => void;
	onCancel: () => void;
}

export function getAccountLabel( user: User ): string | undefined {
	const displayName = user.display_name;
	return displayName && user.username && displayName !== user.username
		? `${ displayName } (@${ user.username })`
		: displayName || user.username;
}

export function getErrorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

export default function PairingCard( {
	title,
	description,
	decoration,
	error,
	connectLabel,
	isBusy,
	onConnect,
	onCancel,
}: PairingCardProps ) {
	return (
		<VStack spacing={ 4 }>
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							decoration={ decoration }
							title={ title }
							description={ description }
						/>
						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ onCancel } disabled={ isBusy }>
								{ __( 'Cancel' ) }
							</Button>
							<Button variant="primary" onClick={ onConnect } isBusy={ isBusy } disabled={ isBusy }>
								{ connectLabel }
							</Button>
						</ButtonStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
