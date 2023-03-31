import { Dialog } from '@automattic/components';
import { useSelector } from 'react-redux';
import { isJetpackGoldenTokenPendingActivation as isJetpackGoldenTokenPendingActivationSelector } from 'calypso/state/selectors/is-jetpack-golden-token-pending-activation';
import { GoldenTokenDialog } from '../golden-token-dialog';

import './style.scss';

// Disabled because Dialog requires an onClose prop, but there is not
// currently anything to do on close here.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const GoldenTokenModal = () => {
	const isJetpackGoldenTokenPendingActivation = useSelector(
		isJetpackGoldenTokenPendingActivationSelector
	);

	if ( ! isJetpackGoldenTokenPendingActivation ) {
		return null;
	}

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
