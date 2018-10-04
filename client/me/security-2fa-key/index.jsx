/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
class Security2faKey extends React.Component {
	getClickHandler = ( action, callback ) => {
		return event => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	render() {
		const { translate } = this.props;
		const { newAppPassword } = true;
		return (
			<Fragment>
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! newAppPassword && (
						<Button
							compact
							onClick={ this.getClickHandler( 'Register New Key Button', this.toggleNewPassword ) }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon="plus-small" size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ translate( 'Register Key' ) }
						</Button>
					) }
				</SectionHeader>
				<Card>Use a Universal 2nd Factor security key to sign in.</Card>
			</Fragment>
		);
	}
}

export default localize( Security2faKey );
