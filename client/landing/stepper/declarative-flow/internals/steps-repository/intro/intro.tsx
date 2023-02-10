import { Button } from '@automattic/components';
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import CloseIcon from './icons/close-icon';
import type { WPElement } from '@wordpress/element';

interface Props {
	onSubmit: () => void;
	introContent: IntroContent;
}

export interface IntroContent {
	title: WPElement | string;
	text?: WPElement | string;
	buttonText: string;
	modal?: IntroModal;
}

export interface IntroModalContentProps {
	onSubmit?: () => void;
}

export interface IntroModal {
	buttonText: string;
	onClick?: () => void;
	content?: React.FC< IntroModalContentProps >;
}

const Intro: React.FC< Props > = ( { onSubmit, introContent } ) => {
	const [ showModal, setShowModal ] = useState( false );
	const { title, text, buttonText, modal } = introContent;

	const modalClasses = classNames( 'intro__more-modal', {
		show: showModal,
	} );

	const handleMoreClick = () => {
		setShowModal( true );
		if ( modal && modal.onClick ) {
			modal.onClick();
		}
	};

	const handleModalClose = () => {
		setShowModal( false );
	};

	return (
		<>
			<div className="intro__content">
				<h1 className="intro__title">
					<span>{ title }</span>
				</h1>
				{ text && <div className="intro__description"> { text } </div> }
				<div className="intro__button-row">
					<Button className="intro__button" primary onClick={ onSubmit }>
						{ buttonText }
					</Button>
					{ modal && (
						<Button className="intro__button-more" transparent onClick={ handleMoreClick }>
							{ modal.buttonText }
						</Button>
					) }
				</div>
			</div>
			{ modal && (
				<div className={ modalClasses }>
					<div className="intro__more-modal-container">
						<div className="intro__more-modal-header">
							<Button plain onClick={ handleModalClose }>
								<CloseIcon />
							</Button>
						</div>
						{ modal.content && <modal.content onSubmit={ onSubmit } /> }
					</div>
				</div>
			) }
		</>
	);
};

export default Intro;
