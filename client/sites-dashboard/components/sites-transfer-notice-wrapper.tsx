import { SitesTransferNotice } from './sites-transfer-notice';

type TransferNoticeWrapperProps = {
	isTransferring: boolean;
	isErrored: boolean;
	isTransferCompleted: boolean;
	className?: string;
};

const TransferNoticeWrapper = ( {
	isTransferring,
	isErrored,
	isTransferCompleted,
	className,
}: TransferNoticeWrapperProps ) => {
	return (
		<div className={ className }>
			{ isTransferring && <SitesTransferNotice isTransferring /> }
			{ ! isTransferring && ( isErrored || isTransferCompleted ) && (
				<SitesTransferNotice isTransferring={ false } hasError={ isErrored } />
			) }
		</div>
	);
};

export default TransferNoticeWrapper;
