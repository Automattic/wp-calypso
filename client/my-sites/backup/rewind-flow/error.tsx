import { Button, Gridicon } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, useEffect } from 'react';
import downloadFailureImage from 'calypso/assets/images/illustrations/jetpack-cloud-download-failure.svg';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hasJetpackCredentials } from 'calypso/state/jetpack/credentials/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface Props {
	imgSrc?: string;
	imgAlt?: string;
	errorText?: TranslateResult;
	siteUrl: string;
	children?: React.ReactNode;
}

const RewindFlowError: FunctionComponent< Props > = ( {
	errorText,
	siteUrl,
	children,
	imgSrc = downloadFailureImage,
	imgAlt = 'jetpack cloud error',
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const hasCredentials = useSelector( ( state ) => hasJetpackCredentials( state, siteId ) );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_restore_failed', {
				has_credentials: hasCredentials,
			} )
		);
	}, [ dispatch, hasCredentials ] );

	const handleContactSupportClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_restore_failed_contact_support_click', {
				has_credentials: hasCredentials,
			} )
		);
	};

	return (
		<>
			<div className="rewind-flow__header">
				<img src={ imgSrc } alt={ imgAlt } />
			</div>
			{ errorText && <h3 className="rewind-flow__title">{ errorText }</h3> }
			{ children }
			<Button
				className="rewind-flow__primary-button"
				href={ contactSupportUrl( siteUrl, 'error' ) }
				primary
				rel="noopener noreferrer"
				target="_blank"
				onClick={ handleContactSupportClick }
			>
				{ translate( 'Contact support {{externalIcon/}}', {
					components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
				} ) }
			</Button>
		</>
	);
};

export default RewindFlowError;
