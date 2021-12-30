import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { getUserLicenses, getUserLicensesCounts } from 'calypso/state/user-licensing/selectors';
import type { License } from 'calypso/state/user-licensing/types';

import './style.scss';

interface Props {
	urlQueryArgs: {
		[ key: string ]: string;
	};
}

function LicensingPromptDialog( { urlQueryArgs }: Props ) {
	const { redirect } = urlQueryArgs;
	const translate = useTranslate();
	const [ showLicensesDialog, setShowLicensesDialog ] = useState< boolean >( false );
	const [ detachedUserLicense, setDetachedUserLicense ] = useState< License | null >( null );
	const userLicenses = useSelector( getUserLicenses );
	const userLicensesCounts = useSelector( getUserLicensesCounts );

	const hasOneDetachedLicense = userLicensesCounts && userLicensesCounts[ 'detached' ] === 1;
	const hasDetachedLicenses = userLicensesCounts && userLicensesCounts[ 'detached' ] !== 0;

	useEffect( () => {
		if ( userLicenses && hasOneDetachedLicense ) {
			setDetachedUserLicense(
				Object.values( userLicenses.items ).filter( ( { attachedAt } ) => attachedAt === null )[ 0 ]
			);
		}
	}, [ hasOneDetachedLicense, userLicenses ] );

	useEffect( () => {
		if ( hasDetachedLicenses ) {
			setShowLicensesDialog( true );
		}
	}, [ hasDetachedLicenses ] );

	const title = useMemo( () => {
		if ( hasOneDetachedLicense ) {
			return preventWidows(
				translate( 'Your %(productName)s is pending activation', {
					args: {
						productName: detachedUserLicense && detachedUserLicense.product,
					},
				} )
			);
		}
		return preventWidows( translate( 'You have an available product license key' ) );
	}, [ detachedUserLicense, hasOneDetachedLicense, translate ] );

	const closeDialog = () => {
		setShowLicensesDialog( false );
	};

	return (
		<>
			<Dialog
				additionalClassNames="licensing-prompt-dialog"
				isVisible={ showLicensesDialog }
				onClose={ () => setShowLicensesDialog( false ) }
				shouldCloseOnEsc
			>
				<h1 className="licensing-prompt-dialog__title">{ title }</h1>
				<p>
					{ preventWidows(
						translate(
							'{{strong}}Check your email{{/strong}} for your license key. You should have received it after making your purchase.',
							{
								components: {
									strong: <strong />,
								},
							}
						)
					) }
				</p>
				<div className="licensing-prompt-dialog__actions">
					<Button className="licensing-prompt-dialog__btn" primary href={ redirect }>
						{ translate( 'Activate it now' ) }
					</Button>
					<Button className="licensing-prompt-dialog__btn" onClick={ closeDialog }>
						{ translate( 'Select another product' ) }
					</Button>
				</div>
			</Dialog>
		</>
	);
}

export default LicensingPromptDialog;
