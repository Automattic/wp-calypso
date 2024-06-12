import { bigSkyModalHeader } from '@automattic/design-picker';
import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { brush, Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Link } from 'react-router-dom';
import { navigate } from 'calypso/lib/navigate';

import './style.scss';

type Props = {
	children: React.ReactNode;
	className?: string | undefined;
};

const BigSkyDisclaimerModal: React.FC< Props > = ( { children } ) => {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	const onSubmit = () => {
		closeModal();
		const queryParams = new URLSearchParams( location.search ).toString();
		navigate( `/setup/site-setup/launch-big-sky${ queryParams ? `?${ queryParams }` : '' }` );
	};

	return (
		<>
			<Button className="big-sky-disclaimer-modal__button" variant="link" onClick={ openModal }>
				{ children }
			</Button>
			{ isOpen && (
				<Modal
					className="big-sky-disclaimer-modal__modal"
					onRequestClose={ closeModal }
					headerActions={ <img src={ bigSkyModalHeader } alt="big-sky-modal-header" /> }
				>
					<div className="big-sky-disclaimer-modal__content">
						<h1>{ translate( 'Try Big Sky' ) }</h1>
						<div className="big-sky-disclaimer-modal__body">
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
									<Icon size={ 32 } icon={ brush } />
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
						<Button
							className="big-sky-disclaimer-modal__button-start"
							variant="primary"
							onClick={ onSubmit }
							text={ translate( "Ok, let's get started" ) }
						/>
						<p className="big-sky-disclaimer-modal__footer">
							{ translate(
								'Big Sky is powered by AI. If you have any questions, view our {{a}}AI Guidelines{{/a}}. Be sure to review the AI-generated contents of your site before publishing it.',
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
									},
								}
							) }
						</p>
					</div>
				</Modal>
			) }
		</>
	);
};

export default BigSkyDisclaimerModal;
