/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Image from 'components/image';
import { abtest } from 'lib/abtest';

/**
 * Style dependencies
 */
import './style.scss';

function GuaranteeSeal( visible ) {
	const classes = classNames( {
		'guarantee-seal__hidden': ! visible,
	} );

	return (
		<>
			{ 'variantShowGuarantee' === abtest( 'checkoutGuarantee' ) && (
				<div className="guarantee-seal">
					<Image className={ classes } src="/calypso/images/upgrades/money-back.svg" />
				</div>
			) }
		</>
	);
}

GuaranteeSeal.propTypes = {
	visible: PropTypes.bool,
};

export default GuaranteeSeal;
