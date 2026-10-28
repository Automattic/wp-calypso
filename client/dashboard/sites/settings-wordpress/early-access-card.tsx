import { siteWordPressPrereleaseMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

interface EarlyAccessCardProps {
	site: Site;
	prerelease: WordPressPrerelease;
}

export function EarlyAccessCard( { site, prerelease }: EarlyAccessCardProps ) {
	const mutation = useMutation(
		withSnackbar( siteWordPressPrereleaseMutation( site.ID ), {
			success: __( 'Early access preference saved.' ),
			error: __( 'Failed to save early access preference.' ),
		} )
	);
	const optedOut = mutation.isPending ? mutation.variables : prerelease.opted_out;

	return (
		<Card>
			<CardBody>
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ __( 'Let my site be picked for early access to new WordPress versions' ) }
					help={ __(
						'We pick a few sites at random to get each new WordPress version before its final release.'
					) }
					checked={ ! optedOut }
					disabled={ mutation.isPending }
					onChange={ ( checked ) => mutation.mutate( ! checked ) }
				/>
			</CardBody>
		</Card>
	);
}
