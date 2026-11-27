import { akismetApiKeyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { key } from '@wordpress/icons';
import { Link } from '@wordpress/ui';
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
				<Link openInNewTab href="https://akismet.com/support/getting-started/api-key/">
					{ __( 'How to activate' ) }
				</Link>
			}
			isLoading={ isLoading }
		/>
	);
}
