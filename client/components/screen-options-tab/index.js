/**
 * External Dependencies
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import { useI18n } from '@wordpress/react-i18n';

/**
 * Style dependencies
 */
import './style.scss';

const ScreenOptionsTab = ( { children } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const { __ } = useI18n();

	return (
		<div className="screen-options-tab">
			<button className="screen-options-tab__button" onClick={ () => setIsOpen( ! isOpen ) }>
				<span className="screen-options-tab__label">{ __( 'Screen Options' ) }</span>
				<span
					className={ classNames( 'screen-options-tab__icon', {
						'screen-options-tab__icon--open': isOpen,
						'screen-options-tab__icon--closed': ! isOpen,
					} ) }
				/>
			</button>
			{ isOpen && <div className={ 'screen-options-tab__children' }>{ children }</div> }
		</div>
	);
};

export default ScreenOptionsTab;
