import { __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { FunctionComponent } from 'react';
import FlowCard from '../flow-card';
// import { RecordTrackEvents } from '../../hooks/use-record-add-form-events';

// import './style.scss';

interface Props {
	siteId: number;
}

export const AddSubscribersQuestion: FunctionComponent< Props > = ( { siteId } ) => {
	const { __ } = useI18n();

	return (
		<div className="add-subscriber">
			<h2>
				{ sprintf(
					/* translators: %s is site name */
					__( 'Add subscribers to %s' ),
					siteId
				) }
			</h2>
			<p>
				{ __(
					'We’ll automatically clean duplicate, incomplete, outdated, or spammy emails to boost open rates and engagement.'
				) }
			</p>
			<VStack alignment="top" spacing="2">
				<FlowCard
					icon={ check }
					title={ __( 'Add subscribers manually' ) }
					text={ __( 'Paste their email or username to add them to your site.' ) }
					onClick={ () => {} }
				/>
				<FlowCard
					icon={ check }
					title={ __( 'Use a CSV file' ) }
					text={ __( 'Upload a file with your existing subscribers list.' ) }
					onClick={ () => {} }
				/>
				<FlowCard
					icon={ check }
					title={ __( 'Import from Substack' ) }
					text={ __( 'Quickly bring your subscribers (and even your content!).' ) }
					onClick={ () => {} }
				/>
			</VStack>
			;
		</div>
	);
};
