import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

interface Props {
	siteSlug: string | null;
	enterCredentialsEventName: string;
	goBackEventName: string;
	goBackUrl: string;
}

const MissingCredentials: FunctionComponent< Props > = ( {
	siteSlug,
	enterCredentialsEventName,
	goBackEventName,
	goBackUrl,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	return (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Missing server credentials' ) }</h3>
			<p className="rewind-flow__info">
				{ translate(
					'Enter your server credentials to enable one-click restores from your backups.'
				) }
			</p>
			<div className="rewind-flow__btn-group rewind-flow__btn-group--centered">
				<Button
					href={ goBackUrl }
					className="rewind-flow__back-button"
					onClick={ () => {
						dispatch( recordTracksEvent( goBackEventName ) );
					} }
				>
					{ translate( 'Go back' ) }
				</Button>
				<Button
					primary
					href={ settingsPath( siteSlug ) }
					className="rewind-flow__primary-button"
					onClick={ () => {
						dispatch( recordTracksEvent( enterCredentialsEventName ) );
					} }
				>
					{ translate( 'Enter credentials' ) }
				</Button>
			</div>
		</>
	);
};

export default MissingCredentials;
