/**
 * External dependencies
 */
import { CompactCard, Gridicon } from '@automattic/components';
import { Modal } from '@wordpress/components';
import React from 'react';
/**
 * Internal dependencies
 */
import useLogo from '../hooks/use-logo';
import './generator-modal.scss';

export const GeneratorModal: React.FC = () => {
	const [ modalIsOpen, setModalIsOpen ] = React.useState( false );
	const { message } = useLogo( {} );

	/**
	 * TODO:
	 *  - click handler should be exposed so it can be tampered with from the outside (aka my-site/customer-home)
	 *  - label same as above
	 *  - classes for action box are taken as-is from the original component, not sure how to solve that (keep in sync) since actionbox is not exported
	 */
	return (
		<CompactCard onClick={ () => setModalIsOpen( true ) } className="quick-links__action-box">
			<div className="quick-links__action-box-image" aria-hidden="true">
				<Gridicon className="quick-links__action-box-icon" icon="types" />
			</div>
			<div className="quick-links__action-box-text">
				<span className="quick-links__action-box-label">Create a logo for your site with AI</span>
			</div>
			{ modalIsOpen && (
				<Modal onRequestClose={ () => setModalIsOpen( false ) } className="launched__modal">
					{ message }
				</Modal>
			) }
		</CompactCard>
	);
	// return <div className="message">{ message }</div>;
};
