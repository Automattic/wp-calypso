import { Button, Modal } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { check, copySmall } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { Text } from '../../components/text';
import type { DkimMissingEntry } from '../hooks/use-dkim-record-checks';

import './dkim-records-modal.scss';

const CopyableText = ( { text, label }: { text: string; label: string } ) => {
	const [ isCopied, setIsCopied ] = useState( false );

	useEffect( () => {
		if ( isCopied ) {
			const timerId = window.setTimeout( () => setIsCopied( false ), 4000 );
			return () => window.clearTimeout( timerId );
		}
	}, [ isCopied ] );

	return (
		<div className="dkim-records-modal__copyable">
			<span className="dkim-records-modal__copyable-text">{ text }</span>
			<Button
				size="small"
				icon={ isCopied ? check : copySmall }
				label={ isCopied ? __( 'Copied' ) : label }
				onClick={ () => {
					navigator.clipboard.writeText( text );
					setIsCopied( true );
				} }
			/>
		</div>
	);
};

interface DkimRecordsModalProps {
	entries: DkimMissingEntry[];
	onClose: () => void;
}

const DkimRecordsModal = ( { entries, onClose }: DkimRecordsModalProps ) => (
	<Modal
		title={ _n( 'DKIM record', 'DKIM records', entries.length ) }
		size="large"
		onRequestClose={ onClose }
	>
		<Text as="p">
			{ _n(
				'Add this TXT record at your DNS host.',
				'Add these TXT records at your DNS host.',
				entries.length
			) }
		</Text>
		<table className="dkim-records-modal__records">
			<thead>
				<tr>
					<th>{ __( 'Domain' ) }</th>
					<th>{ __( 'Name' ) }</th>
					<th>{ __( 'Value' ) }</th>
				</tr>
			</thead>
			<tbody>
				{ entries.map( ( { domain, record } ) => (
					<tr key={ domain }>
						<td>{ domain }</td>
						<td>
							<CopyableText
								text={ record.name }
								label={ sprintf(
									/* translators: %s is a domain name */
									__( 'Copy the record name for %s' ),
									domain
								) }
							/>
						</td>
						<td>
							<CopyableText
								text={ record.data }
								label={ sprintf(
									/* translators: %s is a domain name */
									__( 'Copy the record value for %s' ),
									domain
								) }
							/>
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	</Modal>
);

export default DkimRecordsModal;
