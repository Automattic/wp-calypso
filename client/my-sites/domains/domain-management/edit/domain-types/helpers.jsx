/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

function WrapDomainStatusButtons( props ) {
	const wrapperClassNames = classNames( 'domain-types__wrap-me', props.className );
	return (
		<React.Fragment>
			<div className="domain-types__break" />
			<div className={ wrapperClassNames }>{ props.children }</div>
		</React.Fragment>
	);
}

export { WrapDomainStatusButtons };
