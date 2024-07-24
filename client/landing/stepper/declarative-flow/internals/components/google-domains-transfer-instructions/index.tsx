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
	const step2Text = __(
		'Click on the name of the domain that you\'d like to transfer in the "Domains" section.'
	);

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
								__( 'Step 1: Visit your <a>Squarespace domains dashboard</a>' ),
								{
									a: createElement( 'a', {
										href: 'https://account.squarespace.com/domains/',
										target: '_blank',
										rel: 'noreferrer',
									} ),
								}
							) }
						</summary>
						<p>
							{ __(
								'Log in to your Squarespace domains dashboard to see a list of all of your registered domains.'
							) }
						</p>
					</details>
					<details open={ 2 === focusedStep }>
						<summary>{ __( 'Step 2: Select your domain' ) }</summary>
						<p>{ step2Text }</p>
						<img
							className="google-domains-transfer-instructions__image"
							src={ pickDomainImgSrc }
							loading="lazy"
							alt={ step2Text }
							width={ 737 }
							height={ 410 }
						/>
					</details>
					<details open={ 3 === focusedStep }>
						<summary>{ __( 'Step 3: Unlock domain' ) }</summary>
						<p>
							{ __(
								"Once you've opened your domain's settings, ensure that your domain is unlocked."
							) }
						</p>
						{ /* eslint-disable jsx-a11y/media-has-caption */ }
						<video autoPlay loop width={ 1188 } height={ 720 } style={ { aspectRatio: '1.65' } }>
							<source
								src="https://videos.files.wordpress.com/alp24Xtk/unlock-domain-instructions-squarespace_mov_hd.mp4"
								type="video/mp4"
							/>
						</video>
					</details>
					<details open={ 3 === focusedStep || 4 === focusedStep }>
						<summary>{ __( 'Step 4: Get auth code' ) }</summary>
						<p>
							{ __(
								"Request your transfer code. You'll find this at the bottom of your domain's settings page. Squarespace will email you the code (may take several hours) for you to copy to your clipboard."
							) }
						</p>
						{ /* eslint-disable jsx-a11y/media-has-caption */ }
						<video
							autoPlay
							loop
							width={ 1184 }
							height={ 720 }
							style={ { aspectRatio: '1.64444444' } }
						>
							<source
								src="https://videos.files.wordpress.com/dZY2deS5/step-04-720p.mp4"
								type="video/mp4"
							/>
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
