import { Button, Modal } from '@wordpress/components';
import { useState, createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import getAuthCodeImgSrc from 'calypso/assets/images/domains/get-auth-code.png';
import pickDomainImgSrc from 'calypso/assets/images/domains/pick-google-domain.png';
import unlockDomainImgSrc from 'calypso/assets/images/domains/unlock-domain.png';

import './style.scss';

const GoogleDomainsModal = ( { children } ) => {
	const { __ } = useI18n();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	return (
		<>
			<Button
				className="google-domains-transfer-instructions__button"
				variant="link"
				onClick={ openModal }
			>
				{ children }
			</Button>
			{ isOpen && (
				<Modal
					className="google-domains-transfer-instructions__modal"
					title="How to unlock your Google domains"
					onRequestClose={ closeModal }
				>
					<p>
						{ __( 'Follow these steps to transfer your domain from Google to WordPress.com:' ) }
					</p>
					<details>
						<summary>
							{ createInterpolateElement(
								__( 'Step 1: Visit your <a>Google Domains dashboard</a>' ),
								{
									a: createElement( 'a', {
										href: 'https://domains.google.com/registrar/',
										target: '_blank',
										rel: 'noreferrer',
									} ),
								}
							) }
						</summary>
						<p>
							{ __(
								'Log in to your Google Domains dashboard to see a list of all of your registered domains.'
							) }
						</p>
					</details>
					<details>
						<summary>{ __( 'Step 2: Select your domain' ) }</summary>
						<p>{ __( 'Select the domain you want to transfer in the "My domains" section.' ) }</p>
						<img
							className="google-domains-transfer-instructions__image"
							src={ pickDomainImgSrc }
							loading="lazy"
							alt={ __( 'Select the domain you want to transfer in the "My domains" section.' ) }
							width={ 737 }
							height={ 410 }
						/>
					</details>
					<details open>
						<summary>{ __( 'Step 3: Unlock domain' ) }</summary>
						<p>
							{ __(
								'In the "Registration settings" section, ensure that your domain is unlocked.'
							) }
						</p>
						<img
							className="google-domains-transfer-instructions__image"
							src={ unlockDomainImgSrc }
							loading="lazy"
							alt=""
							aria-hidden="true"
							width={ 737 }
							height={ 410 }
						/>
					</details>
					<details>
						<summary>{ __( 'Step 4: Get auth code' ) }</summary>
						<p>
							{ __(
								'Click "Get auth code" and then copy the code that is shown to your clipboard.'
							) }
						</p>
						<img
							className="google-domains-transfer-instructions__image"
							src={ getAuthCodeImgSrc }
							loading="lazy"
							alt=""
							aria-hidden="true"
							width={ 870 }
							height={ 720 }
						/>
					</details>
				</Modal>
			) }
		</>
	);
};

export default GoogleDomainsModal;
