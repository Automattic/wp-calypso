import { ReactNode } from 'react';
import './style.scss';

const PrePurchaseNotice = ( {
	message,
	linkUrl,
	linkText,
}: {
	message: ReactNode;
	linkUrl: string | null | undefined;
	linkText: ReactNode | null | undefined;
} ) => (
	<div className="prepurchase-notice">
		<p className="prepurchase-notice__message">{ message }</p>
		{ linkUrl && linkText && (
			<a className="prepurchase-notice__link" href={ linkUrl }>
				{ linkText }
			</a>
		) }
	</div>
);

export default PrePurchaseNotice;
