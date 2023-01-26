import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LicensingActivationBanner from 'calypso/components/jetpack/licensing-activation-banner';
import LicensingPromptDialog from 'calypso/components/jetpack/licensing-prompt-dialog';
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import { successNotice } from 'calypso/state/notices/actions';
import { ProductStoreBaseProps } from './types';

export const UserLicensesDialog: React.FC< ProductStoreBaseProps > = ( { siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( window.location.pathname.startsWith( JPC_PATH_PLANS ) ) {
			dispatch( successNotice( translate( 'Jetpack is successfully connected' ) ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<div>
			{ siteId && (
				<>
					<LicensingPromptDialog siteId={ siteId } />
					<LicensingActivationBanner siteId={ siteId } />
				</>
			) }
		</div>
	);
};
