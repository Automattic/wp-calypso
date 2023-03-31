import { Dialog } from '@automattic/components';
import { GoldenTokenDialog } from '../golden-token-dialog';

import './style.scss';

// Disabled because Dialog requires an onClose prop, but there is not
// currently anything to do on close here.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const GoldenTokenModal = () => {
	return (
		<Dialog
			additionalClassNames="golden-token-modal"
			isVisible={ true }
			isBackdropVisible={ false }
			onClose={ noop }
		>
			<GoldenTokenDialog />
		</Dialog>
	);
};
