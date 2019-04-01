/**
 * External dependencies
 */
import React, { Component } from 'react';
import RenderDom from 'react-dom';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Main from 'components/main';

/**
 *
 * Style dependencies
 */
import './style.scss';

class RegistrantVerificationPage extends Component {
	render() {
		return (
			<Main className="registrant-verification">
				<CompactCard>
					<h2>{ 'Verify your contact information' }</h2>
				</CompactCard>
				<CompactCard>
					<Button className="registrant-verification__button">
						{ 'Verify Your Contact Information' }
					</Button>
				</CompactCard>
			</Main>
		);
	}
}

/**
 * Default export. Boots up the landing page.
 */
function boot() {
	RenderDom.render( <RegistrantVerificationPage />, document.getElementById( 'primary' ) );
}

boot();
