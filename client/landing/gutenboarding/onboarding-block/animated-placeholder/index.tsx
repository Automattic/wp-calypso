/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

const AnimatedPlaceholder: FunctionComponent = props => {
	const classes = classnames( 'animated-input-placeholder', props.slow ? 'slow-speed' : null );
	return (
		<div className={ classes }>
			<div className="animated-input-placeholder__content">
				{ props.texts.map( ( suggestion, index ) => (
					<span className="animated-input-placeholder__suggestion" key={ index }>
						{ suggestion }
					</span>
				) ) }
			</div>
		</div>
	);
};

export default AnimatedPlaceholder;
