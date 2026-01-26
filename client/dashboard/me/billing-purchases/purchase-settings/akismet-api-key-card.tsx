import { akismetApiKeyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import OverviewCard from '../../../components/overview-card';

export default function AkismetApiKeyCard() {
	const { data, isError, isLoading } = useQuery( {
		...akismetApiKeyQuery(),
		refetchOnWindowFocus: false,
	} );

	if ( isError ) {
		return null;
	}

	const akismetApiKey = data ?? '';

	return (
		<OverviewCard
			icon={ key }
			title={ __( 'API key' ) }
			heading={
				<ClipboardInputControl
					label={ __( 'API key' ) }
					value={ akismetApiKey }
					readOnly
					disabled={ isLoading }
					hideLabelFromVision
				/>
			}
			description={
				<ExternalLink href="https://akismet.com/support/getting-started/api-key/">
					{ __( 'How to activate' ) }
				</ExternalLink>
			}
			isLoading={ isLoading }
		/>
	);
}
