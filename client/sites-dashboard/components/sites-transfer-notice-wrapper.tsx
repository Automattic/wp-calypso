import { SitesTransferNotice } from './sites-transfer-notice';

type TransferNoticeWrapperProps = {
	isTransfering: boolean;
	hasError: boolean;
	isTransferCompleted: boolean;
	className?: string;
};

const TransferNoticeWrapper = ( {
	isTransfering,
	hasError,
	isTransferCompleted,
	className,
}: TransferNoticeWrapperProps ) => {
	return (
		<div className={ className }>
			{ isTransfering && <SitesTransferNotice isTransfering={ true } /> }
			{ ! isTransfering && ( hasError || isTransferCompleted ) && (
				<SitesTransferNotice isTransfering={ false } hasError={ hasError } />
			) }
		</div>
	);
};

export default TransferNoticeWrapper;
