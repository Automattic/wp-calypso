import {
	__experimentalSpacer as Spacer,
	__experimentalVStack as VStack,
	ProgressBar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import scanScanningIllustration from './scan-scanning-illustration.svg';
import type { ScanState } from './use-scan-state';

interface ScanStatusProps {
	scanState: ScanState;
}

export function ScanStatus( { scanState }: ScanStatusProps ) {
	const { status, scan } = scanState;

	if ( status !== 'enqueued' && status !== 'running' ) {
		return null;
	}

	const statusContent = {
		enqueued: {
			title: __( 'Preparing to Scan…' ),
			description: __( 'We are starting to scan your site now.' ),
		},
		running: {
			title: __( 'Scanning in progress' ),
			description: __( 'We’re scanning your site for threats…' ),
		},
	};

	const { title, description } = statusContent[ status as 'enqueued' | 'running' ] || {
		title: '',
		description: '',
	};

	return (
		<Spacer marginBottom={ 24 } marginTop={ 12 }>
			<VStack alignment="center">
				<img
					src={ scanScanningIllustration }
					alt={ __( 'Scan scanning illustration' ) }
					width={ 408 }
					height={ 280 }
				/>
				<Text weight={ 500 } size={ 20 }>
					{ title }
				</Text>
				<Text variant="muted">{ description }</Text>
				{ status === 'running' && (
					<ProgressBar
						value={ scan?.current?.progress ?? 0 }
						className="dashboard-scan__progress-bar"
					/>
				) }
			</VStack>
		</Spacer>
	);
}
