import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useMemo, useRef } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4AThemedModal from '../../a4a-themed-modal';
import modalImage from './modal-image.jpg';

import './style.scss';

function isValidURL( url: string ) {
	return /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url );
}

type Props = {
	onClose: () => void;
};

export default function A4AConnectionModal( { onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ site, setSite ] = useState( '' );
	const linkRef = useRef< HTMLAnchorElement >( null );

	const onComplete = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_add_site_via_a4a_connection_modal_button_click', {
				site,
			} )
		);
		onClose?.();
	};

	const onSiteChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setSite( event.currentTarget.value );
	};

	const buttonUrl = useMemo( () => {
		if ( ! isValidURL ) {
			return '';
		}
		try {
			const validSite = ! /^https?:\/\//i.test( site )
				? new URL( `https://${ site }` )
				: new URL( site );
			const url = new URL(
				`${ validSite.origin }/wp-admin/plugin-install.php?s=automattic-for-agencies-client&tab=search&type=term`
			);
			return url.href;
		} catch ( e ) {
			return '';
		}
	}, [ site ] );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( ! isValidURL( site ) ) {
			return;
		}
		if ( event.key === 'Enter' ) {
			linkRef?.current?.click?.();
		}
	};

	return (
		<A4AThemedModal
			className="a4a-connection-modal"
			modalImage={ modalImage }
			onClose={ onClose }
			dismissable
		>
			<h1 className="a4a-connection-modal__title">
				{ translate(
					'Add a site by remotely installing the Automattic for Agencies client plugin'
				) }
			</h1>

			<p className="a4a-connection-modal__instruction">
				{ translate(
					'This lightweight plugin securely connects your clients’ sites to the Automattic for Agencies Sites Dashboard, enabling you to manage them from one place and to be notified immediately if any site is experiencing security or performance issues.'
				) }
			</p>

			<div className="a4a-connection-modal__input-container">
				<FormFieldset>
					<FormLabel htmlFor="site">{ translate( 'What site do you want to connect?' ) }</FormLabel>
					<FormTextInput
						name="site"
						id="site"
						placeholder={ translate( 'Site URL' ) }
						value={ site }
						onChange={ onSiteChange }
						onKeyDown={ handleKeyDown }
						onClick={ () =>
							dispatch(
								recordTracksEvent( 'calypso_a4a_add_site_via_a4a_connection_modal_site_url_click' )
							)
						}
					/>
				</FormFieldset>

				<Button
					primary
					ref={ linkRef }
					onClick={ onComplete }
					disabled={ ! isValidURL( site ) }
					href={ buttonUrl }
					target="_blank"
					rel="noreferrer noopener"
				>
					{ translate( 'Connect' ) }
				</Button>
			</div>
		</A4AThemedModal>
	);
}
