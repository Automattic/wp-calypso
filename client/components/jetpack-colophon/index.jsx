/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackColophon = ( { className, translate } ) => {
	return (
		<div className={ classNames( 'jetpack-colophon', className ) }>
			<span className="jetpack-colophon__power">
				{ translate( 'Powered by {{jetpackLogo /}}', {
					components: {
						jetpackLogo: <JetpackLogo size={ 32 } full />,
					},
				} ) }
			</span>
		</div>
	);
};

export default localize( JetpackColophon );
