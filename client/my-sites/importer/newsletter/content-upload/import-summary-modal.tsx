import { Button, Modal } from '@wordpress/components';

interface ImportSummaryModalProps {
	onRequestClose: () => void;
	postsNumber: number;
	pagesNumber: number;
	attachmentsNumber: number;
	authorsNumber?: number;
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
			<p>
				We’ve found <strong>{ postsNumber } posts</strong>, <strong>{ pagesNumber } pages</strong>{ ' ' }
				and <strong>{ attachmentsNumber } media</strong> to import.
				{ authorsNumber && (
					<>
						<br />
						Your Substack publication has <strong>{ authorsNumber } authors</strong>. Next, you can
						match them with existing site users.
					</>
				) }
			</p>
			<Button variant="primary" onClick={ onRequestClose }>
				Continue
			</Button>
		</Modal>
	);
}
