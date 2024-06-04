import { Button } from '@automattic/components';
import { useState } from '@wordpress/element';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import CloseIcon from './icons/close-icon';

interface Props {
	onSubmit: () => void;
	introContent: IntroContent;
}

export interface IntroContent {
	title: React.ReactElement | string;
	text?: React.ReactElement | string;
	secondaryText?: React.ReactElement | string;
	buttonText: string;
	secondaryButtonText?: string;
	modal?: IntroModal;
}

export interface IntroModalContentProps extends PropsWithChildren {
	onSubmit?: () => void;
}

export interface IntroModal {
	buttonText: string;
	onClick?: () => void;
	content?: React.FC< IntroModalContentProps >;
}

const Intro: React.FC< Props > = ( { onSubmit, introContent } ) => {
	const [ showModal, setShowModal ] = useState( false );
	const { title, text, buttonText, modal, secondaryButtonText, secondaryText } = introContent;

	const modalClasses = clsx( 'intro__more-modal', {
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
					{ secondaryButtonText && (
						<Button
							className="intro__button-more"
							href="https://wordpress.com/create-a-course/"
							transparent
						>
							{ secondaryButtonText }
						</Button>
					) }
					{ modal && (
						<Button className="intro__button-more" transparent onClick={ handleMoreClick }>
							{ modal.buttonText }
						</Button>
					) }
				</div>
				{ secondaryText && <div className="intro__secondary-text">{ secondaryText }</div> }
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
