import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

export default function ReaderPreferences() {
	const { data: isSeenPostsEnabled } = useSuspenseQuery(
		userPreferenceQuery( 'reader-seen-posts' )
	);
	const { mutate: saveSeenPostsPreference, isPending } = useMutation(
		userPreferenceMutation( 'reader-seen-posts' )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleToggle = ( enabled: boolean ) => {
		saveSeenPostsPreference( enabled, {
			onSuccess: () => {
				createSuccessNotice(
					enabled ? __( 'Read status enabled.' ) : __( 'Read status disabled.' ),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				createErrorNotice(
					enabled ? __( 'Failed to enable read status.' ) : __( 'Failed to disable read status.' ),
					{ type: 'snackbar' }
				);
			},
		} );
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
							title={ __( 'Read status' ) }
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
