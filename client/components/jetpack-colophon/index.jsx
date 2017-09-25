/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';

const JetpackColophon = ( { className, translate } ) => {
	return (
		<div className={ classNames( 'jetpack-colophon', className ) }>
			<span className="jetpack-colophon__power">
				{ translate( 'Powered by {{jetpackLogo /}}', {
					components: {
						jetpackLogo: <JetpackLogo size={ 24 } full />,
					},
				} ) }
			</span>
		</div>
	);
};

export default localize( JetpackColophon );
