import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

export default function ReaderPreferences() {
	const { data: isSeenPostsEnabled } = useSuspenseQuery(
		userPreferenceQuery( 'reader-seen-posts' )
	);
	const { mutate: saveSeenPostsPreference, isPending } = useMutation(
		withSnackbar( userPreferenceMutation( 'reader-seen-posts' ), {
			success: __( 'Reader preference saved.' ),
			error: __( 'Failed to save Reader preference.' ),
		} )
	);

	const handleToggle = ( enabled: boolean ) => {
		saveSeenPostsPreference( enabled );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Reader' ) }
					description={ __( 'Manage how the Reader shows posts you have already read.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Show read status' ) }
							description={ __(
								'Dims posts you have already opened, shows unread counts in the sidebar, and surfaces Mark as read actions.'
							) }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Show read status' ) }
							checked={ isSeenPostsEnabled }
							disabled={ isPending }
							onChange={ handleToggle }
						/>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
