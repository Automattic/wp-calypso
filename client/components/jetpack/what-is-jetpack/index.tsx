/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackLogo from 'calypso/components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	className?: string;
}

const WhatIsJetpack: React.FC< Props > = ( { className } ) => {
	return (
		<div className={ classnames( 'what-is-jetpack', className ) }>
			<div className="what-is-jetpack__jetpack-logo">
				<JetpackLogo size={ 36 } full />
			</div>
			<div>
				<h4 className="what-is-jetpack__question">{ translate( 'What is Jetpack?' ) }</h4>
				<p className="what-is-jetpack__answer">
					{ translate(
						'Jetpack is a feature-rich plugin for WordPress sites. Because your site is hosted with us at WordPress.com, you already have access to most Jetpack’s features.'
					) }
					<br />
					<a href="https://jetpack.com/" target="_blank" rel="noopener noreferrer">
						{ translate( 'Find out more about Jetpack.' ) }
					</a>
				</p>
			</div>
		</div>
	);
};

export default WhatIsJetpack;
