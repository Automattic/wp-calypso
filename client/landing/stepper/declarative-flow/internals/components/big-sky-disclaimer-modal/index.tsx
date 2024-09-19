import { bigSkyModalHeader } from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Link } from 'react-router-dom';
import Brush from 'calypso/assets/images/icons/brush.svg';
import SVGIcon from 'calypso/components/svg-icon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';

import './style.scss';

type Props = {
	children: React.ReactNode;
	className?: string | undefined;
	flow: string;
	stepName: string;
};

const BigSkyDisclaimerModal: React.FC< Props > = ( { children, flow, stepName } ) => {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => {
		recordTracksEvent( 'calypso_big_sky_disclaimer_modal_open', {
			flow,
			step: stepName,
		} );
		setOpen( true );
	};
	const closeModal = () => {
		recordTracksEvent( 'calypso_big_sky_disclaimer_modal_close', {
			flow,
			step: stepName,
		} );
		setOpen( false );
	};

	const onSubmit = () => {
		recordTracksEvent( 'calypso_big_sky_disclaimer_accept', {
			flow,
			step: stepName,
		} );
		setOpen( false );
		const queryParams = new URLSearchParams( location.search ).toString();
		navigate( `/setup/site-setup/launch-big-sky${ queryParams ? `?${ queryParams }` : '' }` );
	};

	return (
		<>
			<div
				className="big-sky-disclaimer-modal__wrapper"
				role="button"
				onClick={ openModal }
				tabIndex={ 0 }
				onKeyDown={ ( event ) => {
					if ( event.key === 'Enter' || event.key === ' ' ) {
						openModal();
					}
				} }
			>
				{ children }
			</div>
			{ isOpen && (
				<Modal
					className="big-sky-disclaimer-modal__modal"
					onRequestClose={ closeModal }
					headerActions={ <img src={ bigSkyModalHeader } alt="big-sky-modal-header" /> }
				>
					<div className="big-sky-disclaimer-modal__content">
						<div className="big-sky-disclaimer-modal__body">
							<h1>{ translate( 'Try Big Sky' ) }</h1>
							<h2>
								{ translate(
									'Build a stunning website effortlessly with Big Sky, our AI-powered website builder. No coding required.'
								) }
							</h2>
							<div className="big-sky-disclaimer-modal__features">
								<div className="feature">
									<Icon size={ 32 } icon={ layout } />
									<p>
										<strong>{ translate( 'Generate single page websites' ) }</strong>
										<br />
										{ translate(
											'Just tell us your vision, and our smart website assistant will weave it into reality.'
										) }
									</p>
								</div>
								<div className="feature">
									<SVGIcon
										classes="big-sky-brush-icon"
										size={ 32 }
										name="big-sky-brush"
										icon={ Brush }
									/>
									<p>
										<strong>{ translate( 'Give your creativity a head start' ) }</strong>
										<br />
										{ translate(
											'Switch up your site’s style on a whim—experiment with designs, colors, and fonts with just a click. Creativity is now your superpower.'
										) }
									</p>
								</div>
							</div>
						</div>
						<p className="big-sky-disclaimer-modal__footer">
							{ translate(
								'Big Sky is powered by AI. Please review our {{a}}AI Guidelines{{/a}} and the contents of your site to ensure it complies with our {{b}}User Guidelines{{/b}}.',
								{
									components: {
										a: (
											<Link
												to="https://automattic.com/ai-guidelines/"
												target="_blank"
												rel="noopener noreferrer"
												title={ translate( 'Automattic AI Guidelines' ) }
											/>
										),
										b: (
											<Link
												to={ localizeUrl( 'https://wordpress.com/support/user-guidelines/' ) }
												target="_blank"
												rel="noopener noreferrer"
												title={ translate( 'WordPress.com User Guidelines' ) }
											/>
										),
									},
								}
							) }
						</p>
						<Button
							className="big-sky-disclaimer-modal__button-start"
							variant="primary"
							onClick={ onSubmit }
							text={ translate( "Ok, let's get started" ) }
						/>
					</div>
				</Modal>
			) }
		</>
	);
};

export default BigSkyDisclaimerModal;
