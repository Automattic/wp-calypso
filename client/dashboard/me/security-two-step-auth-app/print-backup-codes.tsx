import { generateBackupCodesMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalGrid as Grid,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { page, cloudDownload, copySmall } from '@wordpress/icons';
import { useEffect } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Notice } from '../../components/notice';
import { SectionHeader } from '../../components/section-header';

export default function PrintBackupCodes( { username }: { username?: string } ) {
	const { mutate: generateBackupCodes, data: backupCodes } = useMutation(
		generateBackupCodesMutation()
	);

	useEffect( () => {
		generateBackupCodes();
	}, [ generateBackupCodes ] );

	const getBackupCodeHTML = ( codes: string[] ) => {
		let html = '<html><head><title>';

		html += __( 'WordPress.com Backup Verification Codes' );
		html += '</title></head>';
		html += '<body style="font-family:sans-serif">';

		html +=
			'<div style="padding:20px; border:1px dashed black; display:inline-block; margin:20px;">';
		html +=
			'<p style="margin-top:0"><strong>' +
			__( 'WordPress.com backup verification codes' ) +
			'</strong></p>';

		html += '<table style="border-spacing:30px 5px">';
		html += '<tbody>';

		// Display codes in 2 columns, 5 rows
		for ( let row = 0; row < 5; row++ ) {
			html += '<tr>';
			html += '<td>' + ( row + 1 ) + '. <strong>' + codes[ row * 2 ] + '</strong></td>';
			if ( codes[ row * 2 + 1 ] ) {
				html += '<td>' + ( row + 6 ) + '. <strong>' + codes[ row * 2 + 1 ] + '</strong></td>';
			}
			html += '</tr>';
		}

		html += '</tbody></table>';
		html += '</div></body></html>';

		return html;
	};

	const handlePrint = () => {
		if ( ! backupCodes?.codes ) {
			return;
		}

		const popup = window.open( '', '_blank' );
		if ( popup ) {
			popup.document.documentElement.innerHTML = getBackupCodeHTML( backupCodes.codes );
			popup.print();

			// Close popup after print dialog is dismissed
			setTimeout( () => {
				popup.close();
			}, 100 );
		}
	};

	const handleDownload = () => {
		if ( ! backupCodes?.codes ) {
			return;
		}

		const content = backupCodes.codes.join( '\n' );
		const blob = new Blob( [ content ], { type: 'text/plain' } );
		const url = URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.href = url;
		link.download = `${ username }-backup-codes.txt`;
		document.body.appendChild( link );
		link.click();
		document.body.removeChild( link );
		URL.revokeObjectURL( url );
	};

	const handleCopy = () => {
		if ( ! backupCodes?.codes ) {
			return;
		}
		const codesText = backupCodes.codes.join( '\n' );
		navigator.clipboard.writeText( codesText );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Print or download your backup codes' ) }
						level={ 3 }
						description={ __(
							"Backup codes let you access your account if you lose your phone or can't use your authenticator app. Each code can only be used once. Store them in a safe place."
						) }
					/>
					<Notice variant="warning">
						{ __(
							'Without access to the app, your phone, or a backup code, you will lose access to your account.'
						) }
					</Notice>
					{ backupCodes && (
						<Card>
							<CardBody>
								<Grid columns={ 2 }>
									{ backupCodes.codes.map( ( code ) => (
										<Text key={ code } align="center" size="15px">
											{ code }
										</Text>
									) ) }
								</Grid>
							</CardBody>
							<CardFooter>
								<ButtonStack justify="center">
									<Button variant="tertiary" icon={ page } onClick={ handlePrint }>
										{ __( 'Print' ) }
									</Button>
									<Button variant="tertiary" icon={ cloudDownload } onClick={ handleDownload }>
										{ __( 'Download' ) }
									</Button>
									<Button variant="tertiary" icon={ copySmall } onClick={ handleCopy }>
										{ __( 'Copy' ) }
									</Button>
								</ButtonStack>
							</CardFooter>
						</Card>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
