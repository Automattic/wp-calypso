import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4AThemedModal from '../a4a-themed-modal';
import JetpackConnectionSidebarImage from './sidebar-image.png';

import './style.scss';

function isValidURL( url: string ) {
	return /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url );
}

export default function AddSiteViaJetpackConnectionModal() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ site, setSite ] = useState( '' );

	const onInstallJetpack = () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_add_site_via_jetpack_connection_modal_install_jetpack_click',
				{
					site,
				}
			)
		);
	};

	const onSiteChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setSite( event.currentTarget.value );
	};

	return (
		<A4AThemedModal
			className="add-site-via-jetpack-connection-modal"
			sidebarImage={ JetpackConnectionSidebarImage }
			dismissable
		>
			<h1 className="add-site-via-jetpack-connection-modal__title">
				{ translate( 'Add a site by remotely installing the Jetpack plugin' ) }
			</h1>

			<p className="add-site-via-jetpack-connection-modal__instruction">
				{ translate(
					"The Jetpack plugin let’s you easily connect your clients' sites to Automattic for Agencies. We’ll remotely install Jetpack for you on the site, and it will appear here."
				) }
			</p>

			<div className="add-site-via-jetpack-connection-modal__input-container">
				<FormFieldset>
					<FormLabel htmlFor="site">{ translate( 'What site do you want to connect?' ) }</FormLabel>
					<FormTextInput
						name="site"
						id="site"
						placeholder={ translate( 'Site URL' ) }
						value={ site }
						onChange={ onSiteChange }
						onClick={ () =>
							dispatch(
								recordTracksEvent(
									'calypso_a4a_add_site_via_jetpack_connection_modal_site_url_click'
								)
							)
						}
					/>
				</FormFieldset>

				<Button
					primary
					onClick={ onInstallJetpack }
					disabled={ ! isValidURL( site ) }
					href={ ` https://wordpress.com/jetpack/connect?url=${ site }` }
					target="_blank"
					rel="noreferrer noopener"
				>
					{ translate( 'Install Jetpack' ) }
				</Button>
			</div>
		</A4AThemedModal>
	);
}
