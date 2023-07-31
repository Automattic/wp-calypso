import { Button, Modal } from '@wordpress/components';
import { useState, createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import pickDomainImgSrc from 'calypso/assets/images/domains/pick-google-domain.png';

import './style.scss';

type Props = {
	children: React.ReactNode;
	className?: string | undefined;
	focusedStep?: number | undefined;
};

const GoogleDomainsModal: React.FC< Props > = ( { children, className, focusedStep } ) => {
	const { __ } = useI18n();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	return (
		<>
			<Button
				className={ `google-domains-transfer-instructions__button ${ className }` }
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
					<details open={ 1 === focusedStep }>
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
					<details open={ 2 === focusedStep }>
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
					<details open={ 3 === focusedStep }>
						<summary>{ __( 'Step 3: Unlock domain' ) }</summary>
						<p>
							{ __(
								'In the "Registration settings" section, ensure that your domain is unlocked.'
							) }
						</p>
						{ /* eslint-disable jsx-a11y/media-has-caption */ }
						<video autoPlay loop>
							<source src="https://cldup.com/bYWgYH_hoP.mp4" type="video/mp4" />
						</video>
					</details>
					<details open={ 3 === focusedStep || 4 === focusedStep }>
						<summary>{ __( 'Step 4: Get auth code' ) }</summary>
						<p>
							{ __(
								'Click "Get auth code" and then copy the code that is shown to your clipboard.'
							) }
						</p>
						{ /* eslint-disable jsx-a11y/media-has-caption */ }
						<video autoPlay loop>
							<source src="https://cldup.com/IM6wEuLIbc.mp4" type="video/mp4" />
							<track />
						</video>
					</details>
				</Modal>
			) }
		</>
	);
};

GoogleDomainsModal.defaultProps = {
	focusedStep: 3,
};

export default GoogleDomainsModal;
