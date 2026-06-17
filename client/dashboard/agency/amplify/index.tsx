import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import './style.scss';

export default function AgencyAmplify() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<PageLayout header={ <PageHeader title={ __( 'Amplify' ) } /> }>
			<VStack className="amplify-overview-hero" spacing={ 6 } alignment="center">
				<Heading level={ 1 } weight={ 500 }>
					{ __( 'Your clients want more business. Find out what their site is doing about it.' ) }
				</Heading>
				<Text variant="muted" size={ 16 }>
					{ __(
						'Amplify scans your clients’ connected sites through two lenses: how their prospective clients perceive them on first visit, and how AI tools like ChatGPT and Perplexity read and rank them. Run a scan in minutes. Find what’s holding them back. Deliver fixes that prove your value and build trust.'
					) }
				</Text>
				<RouterLinkButton
					variant="primary"
					to="/agency/amplify/reports"
					onClick={ () => recordTracksEvent( 'calypso_a4a_amplify_overview_cta_click' ) }
				>
					{ __( 'Amplify a site' ) }
				</RouterLinkButton>
			</VStack>
		</PageLayout>
	);
}
