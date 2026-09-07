import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AgencyLicense } from './mock-data';

export default function RevokeLicenseModal( {
	license,
	onRevoke,
	onCancel,
}: {
	license: AgencyLicense;
	onRevoke: () => void;
	onCancel: () => void;
} ) {
	return (
		<VStack spacing={ 6 }>
			<Text>
				{ __(
					'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
				) }
			</Text>

			<VStack spacing={ 2 } className="marketplace-purchases__revoke-details">
				{ license.siteUrl && (
					<Text>
						<strong>{ __( 'Site:' ) }</strong> { license.siteUrl }
					</Text>
				) }
				<Text>
					<strong>{ __( 'Product:' ) }</strong> { license.product }
				</Text>
				<Text>
					<strong>{ __( 'License:' ) }</strong>{ ' ' }
					<code className="marketplace-purchases__revoke-key">{ license.licenseKey }</code>
				</Text>
			</VStack>

			<Text variant="muted">{ __( 'Please note this action cannot be undone.' ) }</Text>

			<HStack justify="flex-end" spacing={ 3 }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onCancel }>
					{ __( 'Go back' ) }
				</Button>
				<Button __next40pxDefaultSize variant="primary" isDestructive onClick={ onRevoke }>
					{ __( 'Revoke license' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
