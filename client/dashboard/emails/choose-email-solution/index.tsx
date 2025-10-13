import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

export default function ChooseEmailSolution() {
	const router = useRouter();
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain = '' } = params;

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Text size={ 18 } as="h1">
				{ __( 'Choose email solution' ) }
			</Text>
			<div style={ { marginTop: 12 } }>
				<Text>
					{ __( 'Domain:' ) } { domain }
				</Text>
			</div>
		</PageLayout>
	);
}
