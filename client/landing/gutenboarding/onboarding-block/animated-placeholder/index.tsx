/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	isSlow?: true;
	texts: string[];
}

const AnimatedPlaceholder: FunctionComponent< Props > = ( { isSlow, texts } ) => {
	return (
		<div
			aria-hidden
			className={ classnames( 'animated-placeholder', {
				'is-slow-speed': isSlow,
			} ) }
		>
			<div className="animated-placeholder__content">
				{ texts.map( suggestion => (
					<span className="animated-placeholder__suggestion" key={ suggestion }>
						{ suggestion }
					</span>
				) ) }
			</div>
		</div>
	);
};

export default AnimatedPlaceholder;
