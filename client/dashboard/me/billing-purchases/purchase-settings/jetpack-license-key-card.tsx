import { jetpackUserLicenseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import OverviewCard from '../../../components/overview-card';

interface JetpackLicenseKeyCardProps {
	purchaseId: number;
}

export default function JetpackLicenseKeyCard( { purchaseId }: JetpackLicenseKeyCardProps ) {
	const { data, isError, isLoading } = useQuery( {
		...jetpackUserLicenseQuery( purchaseId ),
		refetchOnWindowFocus: false,
	} );

	if ( isError ) {
		return null;
	}

	const licenseKey = data?.licenseKey ?? '';

	return (
		<OverviewCard
			icon={ key }
			title={ __( 'License key' ) }
			heading={
				<ClipboardInputControl
					label={ __( 'License key' ) }
					value={ licenseKey }
					readOnly
					disabled={ isLoading }
					hideLabelFromVision
				/>
			}
			description={
				<ExternalLink href="https://jetpack.com/support/activate-a-jetpack-product-via-license-key/">
					{ __( 'How to activate' ) }
				</ExternalLink>
			}
			isLoading={ isLoading }
		/>
	);
}
