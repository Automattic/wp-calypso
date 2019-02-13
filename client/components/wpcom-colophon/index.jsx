/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';

/**
 * Style dependencies
 */
import './style.scss';

const WpcomColophon = ( { className, translate } ) => {
	return (
		<div className={ classNames( 'wpcom-colophon', className ) }>
			<span className="wpcom-colophon__content">
				{ translate( 'In partnership with {{wpcomLogo /}} WordPress.com', {
					components: {
						wpcomLogo: <WordPressLogo size={ 24 } />,
					},
				} ) }
			</span>
		</div>
	);
};

export default localize( WpcomColophon );
