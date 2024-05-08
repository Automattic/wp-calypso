/**
 * WordPress dependencies
 */
import { PaginationControl } from '@automattic/components';
import { Modal, Button } from '@wordpress/components';
import { useState, Children } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { LEFT, RIGHT } from '@wordpress/keycodes';
/**
 * External dependencies
 */
import clsx from 'clsx';
import * as React from 'react';

interface Props {
	className: string;
	children: React.ReactElement[];
	onFinish: () => void;
}

const Guide: React.FC< Props > = ( { children, className, onFinish } ) => {
	const [ currentPage, setCurrentPage ] = useState( 0 );
	const pages = Children.map( children, ( child ) => ( { content: child } ) ) || [];

	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < pages?.length - 1;

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
			className={ clsx( 'components-guide', className ) }
			overlayClassName={ clsx( 'components-guide-overlay', className ) }
			onRequestClose={ onFinish }
			onKeyDown={ ( event ) => {
				if ( event.keyCode === LEFT ) {
					goBack();
				} else if ( event.keyCode === RIGHT ) {
					goForward();
				}
			} }
			title=""
		>
			<div className="guide__container">
				<div className="guide__page">{ pages[ currentPage ].content }</div>

				<div className="guide__footer">
					{ pages.length > 1 && (
						<PaginationControl
							activePageIndex={ currentPage }
							numberOfPages={ pages.length }
							onChange={ setCurrentPage }
						>
							<div className="guide__buttons">
								{ currentPage > 0 && (
									<Button className="guide__back-button" variant="tertiary" onClick={ goBack }>
										{ /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
										{ /* @ts-ignore This is declared as a global variable and provided by webpack. */ }
										{ __( 'Back', __i18n_text_domain__ ) }
									</Button>
								) }
								<Button
									className="guide__forward-button"
									autoFocus={ currentPage === 0 } // eslint-disable-line jsx-a11y/no-autofocus
									variant="primary"
									onClick={ goForward }
								>
									{ canGoForward ? __( 'Next' ) : __( 'Done' ) }
								</Button>
							</div>
						</PaginationControl>
					) }
				</div>
			</div>
		</Modal>
	);
};

export default Guide;
