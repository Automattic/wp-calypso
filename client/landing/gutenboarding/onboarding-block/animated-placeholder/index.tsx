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
			{ texts.map( suggestion => (
				<span className="animated-placeholder__suggestion" key={ suggestion }>
					{ suggestion.split( '' ).map( ( letter, index ) => (
						<span
							className="animated-placeholder__suggestion-letter"
							key={ suggestion + '-' + letter + index }
						>
							{ letter }
						</span>
					) ) }
				</span>
			) ) }
		</div>
	);
};

export default AnimatedPlaceholder;
