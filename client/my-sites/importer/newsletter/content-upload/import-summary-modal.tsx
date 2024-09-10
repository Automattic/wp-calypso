import { Button, Modal } from '@wordpress/components';

interface ImportSummaryModalProps {
	onRequestClose: () => void;
	postsNumber: number;
	pagesNumber: number;
	attachmentsNumber: number;
	authorsNumber?: number;
}

function getContent( postsNumber: number, pagesNumber: number, attachmentsNumber: number ) {
	if ( postsNumber > 0 && pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ postsNumber } posts</strong>, <strong>{ pagesNumber } pages</strong>
				and <strong>{ attachmentsNumber } media</strong> to import.
			</p>
		);
	}

	if ( postsNumber > 0 && pagesNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ pagesNumber } pages</strong> to import.
			</p>
		);
	}

	if ( postsNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ postsNumber } posts</strong> and{ ' ' }
				<strong>{ attachmentsNumber } media</strong> to import.
			</p>
		);
	}

	if ( pagesNumber > 0 && attachmentsNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ pagesNumber } pages</strong> and{ ' ' }
				<strong>{ attachmentsNumber } media</strong> to import.
			</p>
		);
	}

	if ( postsNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ postsNumber } posts</strong> to import.
			</p>
		);
	}

	if ( pagesNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ pagesNumber } pages</strong> to import.
			</p>
		);
	}

	if ( attachmentsNumber > 0 ) {
		return (
			<p>
				We’ve found <strong>{ attachmentsNumber } media</strong> to import.
			</p>
		);
	}
}

export default function ImportSummaryModal( {
	onRequestClose,
	postsNumber,
	pagesNumber,
	attachmentsNumber,
	authorsNumber,
}: ImportSummaryModalProps ) {
	return (
		<Modal title="All set!" isDismissible={ false } onRequestClose={ onRequestClose } size="medium">
			{ getContent( postsNumber, pagesNumber, attachmentsNumber ) }
			{ authorsNumber && (
				<p>
					Your Substack publication has <strong>{ authorsNumber } authors</strong>. Next, you can
					match them with existing site users.
				</p>
			) }
			<Button variant="primary" onClick={ onRequestClose }>
				Continue
			</Button>
		</Modal>
	);
}
