/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { useState, Children } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LEFT, RIGHT } from '@wordpress/keycodes';
/**
 * External dependencies
 */
import classnames from 'classnames';
/**
 * Internal dependencies
 */
import PageControl from './page-control';

export default function Guide( {
	children,
	className,
	contentLabel,
	previousButtonText,
	nextButtonText,
	finishButtonText,
	onFinish,
} ) {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	const pages = Children.map( children, ( child ) => ( { content: child } ) );

	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < pages.length - 1;

	const goBack = () => {
		if ( canGoBack ) {
			setCurrentPage( currentPage - 1 );
		}
	};

	const goForward = () => {
		if ( canGoForward ) {
			setCurrentPage( currentPage + 1 );
		} else {
			onFinish();
		}
	};

	if ( pages.length === 0 ) {
		return null;
	}

	return (
		<Modal
			className={ classnames( 'components-guide', className ) }
			overlayClassName={ classnames( 'components-guide-overlay', className ) }
			contentLabel={ contentLabel }
			onRequestClose={ onFinish }
			onKeyDown={ ( event ) => {
				if ( event.keyCode === LEFT ) {
					goBack();
				} else if ( event.keyCode === RIGHT ) {
					goForward();
				}
			} }
			title={ '' }
		>
			<div className="guide__container">
				<div className="guide__page">{ pages[ currentPage ].content }</div>

				<div className="guide__footer">
					{ pages.length > 1 && (
						<PageControl
							currentPage={ currentPage }
							numberOfPages={ pages.length }
							setCurrentPage={ setCurrentPage }
						/>
					) }

					<div className="guide__buttons">
						{ canGoBack && (
							<Button className="guide__back-button" onClick={ goBack }>
								{ previousButtonText || __( 'Previous' ) }
							</Button>
						) }
						<Button
							className="guide__forward-button"
							autoFocus={ currentPage === 0 } // eslint-disable-line jsx-a11y/no-autofocus
							onClick={ goForward }
						>
							{ canGoForward ? nextButtonText || __( 'Next' ) : finishButtonText || __( 'Finish' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
