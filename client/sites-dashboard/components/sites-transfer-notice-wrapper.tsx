import { SitesTransferNotice } from './sites-transfer-notice';

type TransferNoticeWrapperProps = {
	isTransfering: boolean;
	hasError: boolean;
	isCompact?: boolean;
	isTransferCompleted: boolean;
	className?: string;
};

const TransferNoticeWrapper = ( {
	isTransfering,
	hasError,
	isCompact = false,
	isTransferCompleted,
	className,
}: TransferNoticeWrapperProps ) => {
	return (
		<div className={ className }>
			{ isTransfering && <SitesTransferNotice isTransfering={ true } isCompact={ isCompact } /> }
			{ ! isTransfering && ( hasError || isTransferCompleted ) && (
				<SitesTransferNotice
					isTransfering={ false }
					hasError={ hasError }
					isCompact={ isCompact }
				/>
			) }
		</div>
	);
};

export default TransferNoticeWrapper;
